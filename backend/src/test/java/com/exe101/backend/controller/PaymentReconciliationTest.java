package com.exe101.backend.controller;

import com.exe101.backend.model.*;
import com.exe101.backend.repository.*;
import com.exe101.backend.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest @AutoConfigureMockMvc
class PaymentReconciliationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired PurchaseOrderRepository orders;
    @Autowired UserAccountRepository users;
    @MockBean PaymentGateway gateway;

    @Test void missedCallbackIsRecoveredOnceAndForeignCustomerCannotQuery() throws Exception {
        var customer=users.findByEmail("customer@example.com").orElseThrow();
        var order=orders.save(new PurchaseOrder("QUERY-"+UUID.randomUUID(),customer,1,new BigDecimal("100000"),
                new BigDecimal("70000"),new BigDecimal("30000"),"Test address",null));
        when(gateway.available(PaymentMethod.MOMO)).thenReturn(true);
        when(gateway.create(any())).thenThrow(new IllegalStateException("Simulated network timeout"));
        var body=mapper.readTree(mvc.perform(post("/api/orders/"+order.getId()+"/deposit-payments")
            .with(user("customer@example.com").roles("CUSTOMER")).contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"MOMO\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PENDING")).andReturn().getResponse().getContentAsString());
        long id=body.path("id").asLong();
        when(gateway.query(any())).thenAnswer(call->{
            PaymentTransaction p=call.getArgument(0);
            return Optional.of(new PaymentGateway.VerifiedPayment(p.getMerchantReference(),p.getAmountVnd(),"MOMO-TEST",true));
        });
        mvc.perform(post("/api/payments/"+id+"/reconcile").with(user("admin@example.com").roles("ADMIN"))).andExpect(status().isForbidden());
        for(int i=0;i<2;i++) mvc.perform(post("/api/payments/"+id+"/reconcile").with(user("customer@example.com").roles("CUSTOMER")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PAID"));
        verify(gateway,times(1)).query(any());
        Assertions.assertEquals(0,new BigDecimal("70000").compareTo(orders.findById(order.getId()).orElseThrow().getPaidAmountVnd()));
    }

    @Test void unresolvedQueryRemainsPendingAndIsRateLimited() throws Exception {
        var customer=users.findByEmail("customer@example.com").orElseThrow();
        var order=orders.save(new PurchaseOrder("PENDING-"+UUID.randomUUID(),customer,1,new BigDecimal("100000"),
                new BigDecimal("70000"),new BigDecimal("30000"),"Test address",null));
        when(gateway.available(PaymentMethod.ZALOPAY)).thenReturn(true);
        when(gateway.create(any())).thenReturn(new PaymentGateway.Instructions(null,"https://example.com/pay",null,null,null,null));
        var body=mapper.readTree(mvc.perform(post("/api/orders/"+order.getId()+"/deposit-payments")
            .with(user("customer@example.com").roles("CUSTOMER")).contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"ZALOPAY\"}"))
            .andReturn().getResponse().getContentAsString());
        when(gateway.query(any())).thenReturn(Optional.empty());
        for(int i=0;i<2;i++)mvc.perform(post("/api/payments/"+body.path("id").asLong()+"/reconcile").with(user("customer@example.com").roles("CUSTOMER")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PENDING"));
        verify(gateway,times(1)).query(any());
        Assertions.assertEquals(0,orders.findById(order.getId()).orElseThrow().getPaidAmountVnd().signum());
    }
}

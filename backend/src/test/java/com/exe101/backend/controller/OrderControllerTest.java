package com.exe101.backend.controller;

import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.model.PurchaseOrder;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.PurchaseOrderRepository;
import com.exe101.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Test
    void shouldHandleOrderTrackingFinalPaymentAndReturnRequest() throws Exception {
        UserAccount customer = userAccountRepository.findByEmail("customer@example.com").orElseThrow();
        PurchaseOrder order = new PurchaseOrder(
                "ORD-" + UUID.randomUUID(),
                customer,
                2,
                new BigDecimal("1000000.00"),
                new BigDecimal("700000.00"),
                new BigDecimal("300000.00"),
                "123 Le Loi, Quan 1, TP.HCM",
                "Kiem tra ky truoc khi giao"
        );
        order.changeStatus(OrderStatus.INTERNATIONAL_SHIPPING);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        String confirmWarehouseBody = """
                {
                  "location": "Kho VN - HCM",
                  "note": "Hang da ve kho VN, cho khach thanh toan phan con lai",
                  "inspectionMedia": [
                    {
                      "mediaType": "IMAGE",
                      "mediaUrl": "https://cdn.example.com/orders/check-1.jpg",
                      "note": "Anh kiem hang"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders/{orderId}/vietnam-warehouse", savedOrder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirmWarehouseBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("WAITING_FINAL_PAYMENT"))
                .andExpect(jsonPath("$.inspectionMedia[0].mediaUrl").value("https://cdn.example.com/orders/check-1.jpg"));

        mockMvc.perform(get("/api/orders/{orderId}", savedOrder.getId())
                        .param("customerId", customer.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timeline[5].status").value("VIETNAM_WAREHOUSE"))
                .andExpect(jsonPath("$.timeline[5].reached").value(true));

        String finalPaymentBody = """
                {
                  "customerId": %d,
                  "paymentMethod": "BANK_TRANSFER",
                  "providerTransactionCode": "BANK-TXN-001"
                }
                """.formatted(customer.getId());

        mockMvc.perform(post("/api/orders/{orderId}/final-payment", savedOrder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(finalPaymentBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("FINAL_30"))
                .andExpect(jsonPath("$.amountVnd").value(300000.00));

        String returnRequestBody = """
                {
                  "customerId": %d,
                  "reason": "San pham bi loi, can doi hang",
                  "evidenceUrl": "https://cdn.example.com/orders/return-proof.jpg"
                }
                """.formatted(customer.getId());

        mockMvc.perform(post("/api/orders/{orderId}/return-requests", savedOrder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(returnRequestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"));

        mockMvc.perform(get("/api/orders")
                        .param("customerId", customer.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderCode").value(savedOrder.getOrderCode()));
    }
}

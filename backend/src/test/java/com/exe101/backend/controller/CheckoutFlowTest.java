package com.exe101.backend.controller;

import com.exe101.backend.model.*;
import com.exe101.backend.repository.*;
import com.exe101.backend.service.*;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc
class CheckoutFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired ProductQuoteRepository quotes;
    @Autowired PurchaseOrderRepository orders;
    @Autowired PaymentTransactionRepository payments;
    @Autowired SessionTokenService tokens;
    @Autowired DepositPaymentService settlement;
    UserAccount customer, other, admin;
    String auth, otherAuth, adminAuth;
    ProductQuote quote;
    @BeforeEach void prepare() {
        customer=users.findByEmail("customer@example.com").orElseThrow();
        admin=users.findByEmail("admin@example.com").orElseThrow();
        other=users.save(new UserAccount(UUID.randomUUID()+"@example.com","unused","Other","CUSTOMER"));
        auth="Bearer "+tokens.issue(customer); otherAuth="Bearer "+tokens.issue(other); adminAuth="Bearer "+tokens.issue(admin);
        quote=new ProductQuote(); quote.setMarketplace(Marketplace.XIANYU); quote.setSourceProductId(UUID.randomUUID().toString());
        quote.setSourceUrl("https://www.goofish.com/item?id=12345"); quote.setOriginalName("sample");
        quote.setTranslatedName("Máy ảnh Fujifilm thử nghiệm"); quote.setTranslatedDescription("Mô tả đã dịch");
        quote.setImageUrl("https://example.com/one.jpg"); quote.setImageUrls(new ArrayList<>(List.of("https://example.com/one.jpg","https://example.com/two.jpg")));
        quote.setShopName("Shop"); quote.setShopLevel(ShopLevel.L7); quote.setShopRating(new BigDecimal("4.95")); quote.setShopReviewCount(99);
        quote.setProductPriceCny(new BigDecimal("100")); quote.setDomesticShippingFeeCny(new BigDecimal("10"));
        quote.setServiceFeeVnd(new BigDecimal("18250")); quote.setServiceFeePercent(new BigDecimal("0.05"));
        quote.setInternationalShippingFeeVnd(new BigDecimal("25000")); quote.setInsuranceFeeVnd(new BigDecimal("10000"));
        quote.setExchangeRate(new BigDecimal("3650")); quote.setDepositPercent(new BigDecimal("0.70"));
        quote.setEstimatedTotalVnd(new BigDecimal("454750")); quote.setExpiresAt(LocalDateTime.now().plusHours(6));
        quote=quotes.save(quote);
    }
    Map<String,Object> request(String key,int quantity) {
        var body=new HashMap<String,Object>();
        body.put("customerId",customer.getId()); body.put("productQuoteId",quote.getId()); body.put("quantity",quantity);
        body.put("expectedTotalVnd", quantity == 2 ? 838000 : 454750);
        body.put("shippingAddress","Người nhận, 0900000000, 123 Lê Lợi, TP HCM"); body.put("requestKey",key);
        return body;
    }
    JsonNode create(String key,int quantity) throws Exception {
        return mapper.readTree(mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request(key,quantity)))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }
    @Test void getQuotePreservesGalleryReviewsAndPriceAndQuantityDoesNotMultiplyFixedFees() throws Exception {
        mvc.perform(get("/api/quotes/"+quote.getId())).andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(2)).andExpect(jsonPath("$.seller.reviews").value(99))
                .andExpect(jsonPath("$.totalCny").isNumber()).andExpect(jsonPath("$.costBreakdown.length()").value(5));
        mvc.perform(get("/api/quotes/"+quote.getId()+"/price-preview").param("quantity","2")).andExpect(status().isOk())
                .andExpect(jsonPath("$.grandTotalVnd").value(838000)).andExpect(jsonPath("$.depositAmountVnd").value(586600))
                .andExpect(jsonPath("$.finalAmountVnd").value(251400));
        var created=create(UUID.randomUUID().toString(),2);
        assertEquals(838000,created.path("totalAmountVnd").asInt());
        Long id=created.path("orderId").asLong();
        assertNotNull(orders.findById(id).orElseThrow().getProductQuote());
        mvc.perform(get("/api/orders/"+id).param("customerId",customer.getId().toString()).header("Authorization",auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.productName").value("Máy ảnh Fujifilm thử nghiệm"))
                .andExpect(jsonPath("$.paidAmountVnd").value(0)).andExpect(jsonPath("$.costSnapshotJson").isNotEmpty());
    }
    @Test void retriesReturnSameOrderAndRejectChangedPayload() throws Exception {
        String key=UUID.randomUUID().toString(); var first=create(key,1); var second=create(key,1);
        assertEquals(first.path("orderId"),second.path("orderId"));
        mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request(key,2)))).andExpect(status().isConflict());
    }
    @Test void ownershipAndWishlistAreProtected() throws Exception {
        mvc.perform(get("/api/wishlist").param("userId",customer.getId().toString())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/wishlist").header("Authorization",otherAuth).param("userId",customer.getId().toString())).andExpect(status().isForbidden());
        String body=mapper.writeValueAsString(Map.of("userId",customer.getId(),"productQuoteId",quote.getId()));
        for(int i=0;i<2;i++) mvc.perform(post("/api/wishlist").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated());
        mvc.perform(get("/api/wishlist/check/"+quote.getId()).header("Authorization",auth).param("userId",customer.getId().toString())).andExpect(content().string("true"));
        mvc.perform(delete("/api/wishlist/"+quote.getId()).header("Authorization",auth).param("userId",customer.getId().toString())).andExpect(status().isNoContent());
        mvc.perform(get("/api/wishlist/check/"+quote.getId()).header("Authorization",auth).param("userId",customer.getId().toString())).andExpect(content().string("false"));
        var order=create(UUID.randomUUID().toString(),1);
        mvc.perform(get("/api/orders/"+order.path("orderId").asLong()).header("Authorization",otherAuth).param("customerId",customer.getId().toString())).andExpect(status().isForbidden());
        mvc.perform(post("/api/orders").header("Authorization",otherAuth).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(UUID.randomUUID().toString(),1)))).andExpect(status().isForbidden());
    }
    @Test void bankPaymentNeedsAdminProofAndIsIdempotent() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        String endpoint="/api/orders/"+id+"/deposit-payments";
        String body="{\"method\":\"BANK_TRANSFER\"}";
        JsonNode p=mapper.readTree(mvc.perform(post(endpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PENDING")).andExpect(jsonPath("$.instructions.qrUrl").isNotEmpty())
                .andReturn().getResponse().getContentAsString());
        mvc.perform(post(endpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(jsonPath("$.id").value(p.path("id").asLong()));
        mvc.perform(post(endpoint).header("Authorization",otherAuth).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isForbidden());
        long paymentId=p.path("id").asLong();
        String confirm="/api/admin/payments/"+paymentId+"/confirm-bank";
        String code="BANK-"+UUID.randomUUID();
        String correct=mapper.writeValueAsString(Map.of("amount",318325,"transactionCode",code,"note","Test fixture: matched statement"));
        mvc.perform(post(confirm).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(correct)).andExpect(status().isForbidden());
        mvc.perform(post(confirm).header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON).content(correct.replace("318325","1"))).andExpect(status().isBadRequest());
        assertEquals(0,orders.findById(id).orElseThrow().getPaidAmountVnd().signum());
        for(int i=0;i<2;i++) mvc.perform(post(confirm).header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON).content(correct)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PAID"));
        PurchaseOrder order=orders.findById(id).orElseThrow();
        assertEquals(0,new BigDecimal("318325").compareTo(order.getPaidAmountVnd()));
        assertEquals(OrderStatus.DEPOSIT_PAID,order.getStatus());
        mvc.perform(post(endpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
    }
    @Test void walletDepositDebitsBalanceImmediatelyAndRejectsInsufficientFunds() throws Exception {
        BigDecimal amount=new BigDecimal("318325");
        BigDecimal before=customer.getWalletBalance();
        if(before.compareTo(amount)<0)customer.creditWallet(amount.subtract(before).add(new BigDecimal("100000")));
        users.saveAndFlush(customer);
        BigDecimal funded=users.findById(customer.getId()).orElseThrow().getWalletBalance();
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        mvc.perform(post("/api/orders/"+id+"/deposit-payments").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"WALLET\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.method").value("WALLET"))
                .andExpect(jsonPath("$.status").value("PAID")).andExpect(jsonPath("$.amountVnd").value(318325));
        assertEquals(0,funded.subtract(amount).compareTo(users.findById(customer.getId()).orElseThrow().getWalletBalance()));
        PurchaseOrder paid=orders.findById(id).orElseThrow();
        assertEquals(OrderStatus.DEPOSIT_PAID,paid.getStatus());
        assertEquals(0,amount.compareTo(paid.getPaidAmountVnd()));
        mvc.perform(get("/api/user/wallet").header("Authorization",auth))
                .andExpect(jsonPath("$.transactions[0].type").value("PAYMENT"))
                .andExpect(jsonPath("$.transactions[0].amount").value(-318325));

        var otherRequest=request(UUID.randomUUID().toString(),1);otherRequest.put("customerId",other.getId());
        long otherOrder=mapper.readTree(mvc.perform(post("/api/orders").header("Authorization",otherAuth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(otherRequest))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).path("orderId").asLong();
        mvc.perform(post("/api/orders/"+otherOrder+"/deposit-payments").header("Authorization",otherAuth)
                .contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"WALLET\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("Số dư ví Yufiz không đủ để thanh toán"));
        assertEquals(OrderStatus.WAITING_DEPOSIT,orders.findById(otherOrder).orElseThrow().getStatus());
    }
    @Test void customerCanCancelPendingPaymentAndChooseWalletWithoutCreatingAnotherOrder() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        String endpoint="/api/orders/"+id+"/deposit-payments";
        JsonNode pending=mapper.readTree(mvc.perform(post(endpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"BANK_TRANSFER\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        String cancel="/api/payments/"+pending.path("id").asLong()+"/cancel";
        mvc.perform(post(cancel).header("Authorization",otherAuth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Không phải giao dịch của tôi\"}")).andExpect(status().isForbidden());
        for(int i=0;i<2;i++)mvc.perform(post(cancel).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Đổi sang Ví Yufiz\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
        BigDecimal amount=new BigDecimal("318325");BigDecimal balance=users.findById(customer.getId()).orElseThrow().getWalletBalance();
        if(balance.compareTo(amount)<0){customer=users.findById(customer.getId()).orElseThrow();customer.creditWallet(amount.subtract(balance));users.saveAndFlush(customer);}
        mvc.perform(post(endpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"method\":\"WALLET\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PAID"));
        assertEquals(OrderStatus.DEPOSIT_PAID,orders.findById(id).orElseThrow().getStatus());
    }
    @Test void moneyArrivingAfterCancellationRequiresReviewAndDoesNotPayTheOrder() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        JsonNode pending=mapper.readTree(mvc.perform(post("/api/orders/"+id+"/deposit-payments").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"BANK_TRANSFER\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        long paymentId=pending.path("id").asLong();
        mvc.perform(post("/api/payments/"+paymentId+"/cancel").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Đổi phương thức\"}")).andExpect(jsonPath("$.status").value("CANCELLED"));
        String confirmation=mapper.writeValueAsString(Map.of("amount",318325,"transactionCode","LATE-"+UUID.randomUUID(),"note","Tiền đến sau khi hủy"));
        mvc.perform(post("/api/admin/payments/"+paymentId+"/confirm-bank").header("Authorization",adminAuth)
                .contentType(MediaType.APPLICATION_JSON).content(confirmation))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REVIEW"));
        PurchaseOrder order=orders.findById(id).orElseThrow();
        assertEquals(OrderStatus.WAITING_DEPOSIT,order.getStatus());assertEquals(0,order.getPaidAmountVnd().signum());
    }
    @Test void rejectsExpiredQuotesInvalidQuantityAndAddress() throws Exception {
        var invalid=request(UUID.randomUUID().toString(),0);
        mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(invalid))).andExpect(status().isBadRequest());
        invalid=request(UUID.randomUUID().toString(),1); invalid.put("shippingAddress"," ");
        mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(invalid))).andExpect(status().isBadRequest());
        quote.setExpiresAt(LocalDateTime.now().minusMinutes(1));quotes.save(quote);
        mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(UUID.randomUUID().toString(),1)))).andExpect(status().isConflict());
    }
    @Test void variantsUseTheirOwnPriceAndInventory() throws Exception {
        quote.setVariants(new ArrayList<>(List.of(new ProductVariant("red","Đỏ",new BigDecimal("200"),2))));
        quotes.save(quote);
        mvc.perform(get("/api/quotes/"+quote.getId()+"/price-preview").param("quantity","2").param("variant","red"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.grandTotalVnd").value(1604500));
        mvc.perform(get("/api/quotes/"+quote.getId()+"/price-preview").param("quantity","3").param("variant","red")).andExpect(status().isConflict());
        mvc.perform(get("/api/quotes/"+quote.getId()+"/price-preview").param("variant","bad")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/orders").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(UUID.randomUUID().toString(),1)))).andExpect(status().isBadRequest());
    }
    @Test void forgedProviderCallbacksCannotSettleAnOrder() throws Exception {
        mvc.perform(post("/api/payments/momo/webhook").contentType(MediaType.APPLICATION_JSON).content("{\"resultCode\":0,\"signature\":\"fake\"}")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/payments/zalopay/webhook").contentType(MediaType.APPLICATION_JSON).content("{\"data\":\"{}\",\"mac\":\"fake\"}")).andExpect(status().isBadRequest());
    }
    @Test void completesFulfillmentAndFinalSettlementWithoutSkippingPayment() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        String finalEndpoint="/api/orders/"+id+"/final-payments";
        String method="{\"method\":\"BANK_TRANSFER\"}";
        mvc.perform(post(finalEndpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(method)).andExpect(status().isConflict());
        var p=mapper.readTree(mvc.perform(post("/api/orders/"+id+"/deposit-payments").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content(method)).andReturn().getResponse().getContentAsString());
        String depositCode="DEPOSIT-"+UUID.randomUUID();
        confirm(p.path("id").asLong(),318325,depositCode);
        String endpoint="/api/admin/orders/"+id+"/status";
        var skipped=mapper.writeValueAsString(Map.of("expectedStatus","DEPOSIT_PAID","status","FINAL_PAID","note","skip"));
        mvc.perform(post(endpoint).header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON).content(skipped)).andExpect(status().isConflict());
        mvc.perform(get("/api/admin/orders/"+id).header("Authorization",auth)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/orders").header("Authorization",adminAuth)).andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
        String[] stages={"DEPOSIT_PAID","PURCHASED","SHOP_SHIPPING","CHINA_WAREHOUSE","INTERNATIONAL_SHIPPING","WAITING_FINAL_PAYMENT"};
        for(int i=0;i<stages.length-1;i++) advance(id,stages[i],stages[i+1]);
        var finalPayment=mapper.readTree(mvc.perform(post(finalEndpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(method))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("FINAL_30"))
                .andExpect(jsonPath("$.amountVnd").value(136425)).andExpect(jsonPath("$.instructions.qrUrl").isNotEmpty())
                .andReturn().getResponse().getContentAsString());
        long pid=finalPayment.path("id").asLong();
        mvc.perform(post(finalEndpoint).header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(method)).andExpect(jsonPath("$.id").value(pid));
        mvc.perform(get(finalEndpoint+"/latest").header("Authorization",otherAuth)).andExpect(status().isForbidden());
        String reused=mapper.writeValueAsString(Map.of("amount",136425,"transactionCode",depositCode,"note","Duplicate code"));
        mvc.perform(post("/api/admin/payments/"+pid+"/confirm-bank").header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON).content(reused)).andExpect(status().isConflict());
        String finalCode="FINAL-"+UUID.randomUUID();
        confirm(pid,136425,finalCode); confirm(pid,136425,finalCode);
        assertEquals(0,orders.findById(id).orElseThrow().getPaidAmountVnd().compareTo(new BigDecimal("454750")));
        advance(id,"FINAL_PAID","DELIVERING"); advance(id,"DELIVERING","COMPLETED");
        mvc.perform(get("/api/orders/"+id).param("customerId",customer.getId().toString()).header("Authorization",auth))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
        mvc.perform(post(endpoint).header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("expectedStatus","FINAL_PAID","status","DELIVERING","note","stale")))).andExpect(status().isConflict());
    }
    @Test void cancellationRequiresOwnershipAndNoPaymentAttempt() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        String url="/api/orders/"+id+"/cancel";
        mvc.perform(post(url).header("Authorization",otherAuth)).andExpect(status().isForbidden());
        for(int i=0;i<2;i++)mvc.perform(post(url).header("Authorization",auth)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
        long pending=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        mvc.perform(post("/api/orders/"+pending+"/deposit-payments").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content("{\"method\":\"BANK_TRANSFER\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/orders/"+pending+"/cancel").header("Authorization",auth)).andExpect(status().isConflict());
    }
    @Test void approvedRefundCreditsWalletOnceAndMarksOrderRefunded() throws Exception {
        long orderId=fullyPaidOrder();
        BigDecimal paid=orders.findById(orderId).orElseThrow().getPaidAmountVnd();
        BigDecimal walletBefore=users.findById(customer.getId()).orElseThrow().getWalletBalance();
        String requestBody=mapper.writeValueAsString(Map.of(
                "customerId",customer.getId(),"reason","Sản phẩm không đúng mô tả","requestedAmountVnd",paid));
        JsonNode request=mapper.readTree(mvc.perform(post("/api/orders/"+orderId+"/return-requests")
                .header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.requestedAmountVnd").value(paid.intValue()))
                .andReturn().getResponse().getContentAsString());
        long requestId=request.path("id").asLong();
        String approveBody=mapper.writeValueAsString(Map.of("amountVnd",paid,"note","Đã kiểm tra và chấp nhận hoàn toàn bộ"));
        mvc.perform(post("/api/admin/returns/"+requestId+"/approve").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content(approveBody)).andExpect(status().isForbidden());
        for(int i=0;i<2;i++)mvc.perform(post("/api/admin/returns/"+requestId+"/approve").header("Authorization",adminAuth)
                .contentType(MediaType.APPLICATION_JSON).content(approveBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.refundedAmountVnd").value(paid.intValue()));
        PurchaseOrder refunded=orders.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.REFUNDED,refunded.getStatus());
        assertEquals(0,paid.compareTo(refunded.getRefundedAmountVnd()));
        assertEquals(0,walletBefore.add(paid).compareTo(users.findById(customer.getId()).orElseThrow().getWalletBalance()));
        mvc.perform(get("/api/user/wallet").header("Authorization",auth))
                .andExpect(jsonPath("$.transactions[0].type").value("REFUND"))
                .andExpect(jsonPath("$.transactions[0].reference").value("REFUND:"+requestId))
                .andExpect(jsonPath("$.transactions[0].balanceBefore").value(walletBefore.intValue()))
                .andExpect(jsonPath("$.transactions[0].balanceAfter").value(walletBefore.add(paid).intValue()));
        JsonNode notifications=mapper.readTree(mvc.perform(get("/api/user/notifications").header("Authorization",auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("Hoàn tiền thành công"))
                .andExpect(jsonPath("$[0].targetUrl").value("/wallet"))
                .andReturn().getResponse().getContentAsString());
        long notificationId=notifications.path(0).path("id").asLong();
        long unreadBefore=mapper.readTree(mvc.perform(get("/api/user/notifications/unread-count").header("Authorization",auth))
                .andReturn().getResponse().getContentAsString()).path("count").asLong();
        mvc.perform(post("/api/user/notifications/"+notificationId+"/read").header("Authorization",otherAuth)).andExpect(status().isNotFound());
        mvc.perform(post("/api/user/notifications/"+notificationId+"/read").header("Authorization",auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.readAt").isNotEmpty());
        mvc.perform(get("/api/user/notifications/unread-count").header("Authorization",auth))
                .andExpect(jsonPath("$.count").value(unreadBefore-1));
        mvc.perform(post("/api/user/notifications/read-all").header("Authorization",auth)).andExpect(status().isOk());
        mvc.perform(get("/api/user/notifications/unread-count").header("Authorization",auth))
                .andExpect(jsonPath("$.count").value(0));
        mvc.perform(post("/api/admin/returns/"+requestId+"/approve").header("Authorization",adminAuth)
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("amountVnd",1,"note","Sai số tiền"))))
                .andExpect(status().isConflict());
    }
    @Test void rejectedRefundKeepsWalletAndRestoresOrderStatus() throws Exception {
        long orderId=fullyPaidOrder();
        BigDecimal walletBefore=users.findById(customer.getId()).orElseThrow().getWalletBalance();
        JsonNode request=mapper.readTree(mvc.perform(post("/api/orders/"+orderId+"/return-requests")
                .header("Authorization",auth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("customerId",customer.getId(),"reason","Cần kiểm tra thêm","requestedAmountVnd",100000))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        long requestId=request.path("id").asLong();
        String body=mapper.writeValueAsString(Map.of("note","Minh chứng không khớp với sản phẩm đã giao"));
        for(int i=0;i<2;i++)mvc.perform(post("/api/admin/returns/"+requestId+"/reject").header("Authorization",adminAuth)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REJECTED"));
        assertEquals(OrderStatus.FINAL_PAID,orders.findById(orderId).orElseThrow().getStatus());
        assertEquals(0,walletBefore.compareTo(users.findById(customer.getId()).orElseThrow().getWalletBalance()));
        mvc.perform(post("/api/admin/returns/"+requestId+"/approve").header("Authorization",adminAuth)
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("amountVnd",100000,"note","Không được đổi quyết định"))))
                .andExpect(status().isConflict());
    }
    long fullyPaidOrder() throws Exception {
        long id=create(UUID.randomUUID().toString(),1).path("orderId").asLong();
        String method="{\"method\":\"BANK_TRANSFER\"}";
        JsonNode deposit=mapper.readTree(mvc.perform(post("/api/orders/"+id+"/deposit-payments").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content(method)).andReturn().getResponse().getContentAsString());
        confirm(deposit.path("id").asLong(),318325,"REFUND-DEPOSIT-"+UUID.randomUUID());
        String[] stages={"DEPOSIT_PAID","PURCHASED","SHOP_SHIPPING","CHINA_WAREHOUSE","INTERNATIONAL_SHIPPING","WAITING_FINAL_PAYMENT"};
        for(int i=0;i<stages.length-1;i++)advance(id,stages[i],stages[i+1]);
        JsonNode finalPayment=mapper.readTree(mvc.perform(post("/api/orders/"+id+"/final-payments").header("Authorization",auth)
                .contentType(MediaType.APPLICATION_JSON).content(method)).andReturn().getResponse().getContentAsString());
        confirm(finalPayment.path("id").asLong(),136425,"REFUND-FINAL-"+UUID.randomUUID());
        return id;
    }
    void confirm(long id,int amount,String code) throws Exception {
        mvc.perform(post("/api/admin/payments/"+id+"/confirm-bank").header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("amount",amount,"transactionCode",code,"note","Matched test statement")))).andExpect(status().isOk());
    }
    void advance(long id,String from,String to) throws Exception {
        mvc.perform(post("/api/admin/orders/"+id+"/status").header("Authorization",adminAuth).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("expectedStatus",from,"status",to,"location","Kho test","note","Đã kiểm tra, mã vận đơn TEST"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value(to));
    }
}

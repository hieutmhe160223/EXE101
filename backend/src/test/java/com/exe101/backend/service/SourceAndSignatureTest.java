package com.exe101.backend.service;
import com.exe101.backend.dto.apify.ApifyItemDetail;
import com.exe101.backend.model.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class SourceAndSignatureTest {
    final ObjectMapper mapper = new ObjectMapper();
    @Test void acceptsOnlyMarketplaceHostsAndPreservesPlatformIdentity() {
        assertEquals(Marketplace.XIANYU, MarketplaceLink.parse("https://www.goofish.com/item?id=123").marketplace());
        assertEquals(Marketplace.TAOBAO, MarketplaceLink.parse("https://item.taobao.com/item.htm?id=123").marketplace());
        assertEquals(Marketplace.TMALL, MarketplaceLink.parse("https://detail.tmall.com/item.htm?id=123").marketplace());
        assertNull(MarketplaceLink.parse("https://m.tb.cn/h.test").id());
        assertThrows(IllegalArgumentException.class, () -> MarketplaceLink.parse("https://taobao.com.evil.example/?id=123"));
        assertThrows(IllegalArgumentException.class, () -> MarketplaceLink.parse("https://taobao.com@127.0.0.1/?id=123"));
        assertThrows(IllegalArgumentException.class, () -> MarketplaceLink.parse("file:///etc/passwd?id=123"));
        assertThrows(IllegalArgumentException.class, () -> MarketplaceLink.parse("https://item.taobao.com/?id=1&id=2"));
    }
    @Test void supportsNestedAndFlattenedSellerAndProWithoutCreditLevel() throws Exception {
        var nested=new ApifyItemDetail(mapper.readTree("{\"seller\":{\"name\":\"Shop\",\"yxpPro\":true,\"stats\":{\"goodReviews\":15}}}"));
        assertEquals("Shop",nested.getSellerName()); assertEquals(15,nested.getGoodReviews());
        assertEquals(ShopLevel.PRO,new ShopLevelMapper().map(nested));
        var flat=new ApifyItemDetail(mapper.readTree("{\"seller.name\":\"Flat\",\"seller.stats.goodReviews\":22,\"seller.registeredDays\":\"unknown\"}"));
        assertEquals("Flat",flat.getSellerName());assertEquals(22,flat.getGoodReviews());assertNull(flat.getRegisteredDays());
    }
    @Test void taobaoMappingDoesNotPretendProductReviewsAreShopReputation() throws Exception {
        var item=mapper.readTree("{\"itemId\":\"123\",\"title\":\"camera\",\"price\":\"100.50\",\"pictures\":[\"https://example.com/a.jpg\"],\"shop\":{\"shopName\":\"Test\"},\"stock\":2,\"priceVerified\":false,\"descriptionHtml\":\"<p>Camera</p>\",\"skus\":[{\"skuId\":\"v1\",\"price\":\"120\",\"quantity\":1,\"propsNames\":\"Red\"}],\"reviews\":[{\"content\":\"good\"}]}");
        var normalized=new ApifyTaobaoService(mapper).normalize(item);
        assertEquals(new BigDecimal("100.50"),normalized.getPrice());assertEquals("Test",normalized.getSellerName());
        assertTrue(normalized.isActive());assertNull(normalized.getGoodReviews());
        assertEquals("Camera",normalized.getDescription());assertEquals("v1",normalized.getVariants().get(0).getVariantId());
        assertFalse(normalized.getPriceVerified());
    }
    PaymentGateway gateway() {
        var g=new PaymentGateway(mapper);
        ReflectionTestUtils.setField(g,"momoPartner","partner"); ReflectionTestUtils.setField(g,"momoAccess","access");
        ReflectionTestUtils.setField(g,"momoSecret","fixture-secret"); ReflectionTestUtils.setField(g,"momoCallback","https://example.com/callback");
        ReflectionTestUtils.setField(g,"zaloApp","123"); ReflectionTestUtils.setField(g,"zaloKey1","fixture-key1");
        ReflectionTestUtils.setField(g,"zaloKey2","fixture-key2"); ReflectionTestUtils.setField(g,"zaloCallback","https://example.com/callback");
        return g;
    }
    @Test void momoSignatureBindsAmountAndTransactionReference() throws Exception {
        var g=gateway();
        ObjectNode event=(ObjectNode)mapper.readTree("{\"amount\":10000,\"extraData\":\"\",\"message\":\"Success\",\"orderId\":\"ref\",\"orderInfo\":\"Deposit\",\"orderType\":\"momo_wallet\",\"partnerCode\":\"partner\",\"payType\":\"qr\",\"requestId\":\"ref\",\"responseTime\":1,\"resultCode\":0,\"transId\":999}");
        String raw="accessKey=access&amount=10000&extraData=&message=Success&orderId=ref&orderInfo=Deposit&orderType=momo_wallet&partnerCode=partner&payType=qr&requestId=ref&responseTime=1&resultCode=0&transId=999";
        event.put("signature",PaymentGateway.hmac(raw,"fixture-secret"));
        assertTrue(g.verifyMomo(event).paid());assertEquals("ref",g.verifyMomo(event).reference());
        event.put("amount",1);assertThrows(IllegalArgumentException.class,()->g.verifyMomo(event));
    }
    @Test void zaloVerifiesRawEnvelopeAndMerchantApp() {
        var g=gateway();
        String data="{\"app_id\":123,\"app_trans_id\":\"260915_test\",\"amount\":10000,\"zp_trans_id\":456}";
        ObjectNode event=mapper.createObjectNode().put("data",data).put("mac",PaymentGateway.hmac(data,"fixture-key2"));
        assertEquals("456",g.verifyZalo(event).transactionCode());
        event.put("data",data.replace("10000","1"));
        assertThrows(IllegalArgumentException.class,()->g.verifyZalo(event));
        String wrongApp=data.replace("\"app_id\":123","\"app_id\":999");
        event.put("data",wrongApp).put("mac",PaymentGateway.hmac(wrongApp,"fixture-key2"));
        assertThrows(IllegalArgumentException.class,()->g.verifyZalo(event));
    }
    PaymentTransaction queryPayment(PaymentMethod method) {
        var payment=new PaymentTransaction(null,null,PaymentType.FINAL_30,method,PaymentStatus.PENDING,new BigDecimal("10000"),null,null);
        payment.setMerchantReference("260915_ref"); return payment;
    }
    @Test void queryMomoSignsRequestAndRejectsWrongReference() throws Exception {
        var g=gateway();
        ReflectionTestUtils.setField(g,"momoQueryEndpoint","https://test-payment.momo.vn/v2/gateway/api/query");
        var server=org.springframework.test.web.client.MockRestServiceServer.createServer((org.springframework.web.client.RestTemplate)ReflectionTestUtils.getField(g,"http"));
        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo("https://test-payment.momo.vn/v2/gateway/api/query"))
            .andRespond(request -> {
                var body=mapper.readTree(((org.springframework.mock.http.client.MockClientHttpRequest)request).getBodyAsString());
                assertEquals(PaymentGateway.hmac("accessKey=access&orderId=260915_ref&partnerCode=partner","fixture-secret"),body.path("signature").asText());
                String response=mapper.writeValueAsString(java.util.Map.of("partnerCode","partner","orderId","WRONG","requestId",body.path("requestId").asText(),"amount",10000,"transId",123,"resultCode",0));
                return new org.springframework.mock.http.client.MockClientHttpResponse(response.getBytes(java.nio.charset.StandardCharsets.UTF_8),org.springframework.http.HttpStatus.OK) {{getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);}};
            });
        assertThrows(IllegalStateException.class,()->g.query(queryPayment(PaymentMethod.MOMO))); server.verify();
    }
    @Test void queryZaloDistinguishesPendingFromConfirmedReceipt() {
        var g=gateway(); ReflectionTestUtils.setField(g,"zaloQueryEndpoint","https://sb-openapi.zalopay.vn/v2/query");
        var server=org.springframework.test.web.client.MockRestServiceServer.createServer((org.springframework.web.client.RestTemplate)ReflectionTestUtils.getField(g,"http"));
        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo("https://sb-openapi.zalopay.vn/v2/query"))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath("$.mac").value(PaymentGateway.hmac("123|260915_ref|fixture-key1","fixture-key1")))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess("{\"return_code\":3,\"is_processing\":true}",org.springframework.http.MediaType.APPLICATION_JSON));
        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo("https://sb-openapi.zalopay.vn/v2/query"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess("{\"return_code\":1,\"is_processing\":false,\"amount\":10000,\"zp_trans_id\":456}",org.springframework.http.MediaType.APPLICATION_JSON));
        var payment=queryPayment(PaymentMethod.ZALOPAY);
        assertTrue(g.query(payment).isEmpty()); var result=g.query(payment).orElseThrow();
        assertEquals(new BigDecimal("10000"),result.amount()); assertEquals("456",result.transactionCode()); server.verify();
    }
}

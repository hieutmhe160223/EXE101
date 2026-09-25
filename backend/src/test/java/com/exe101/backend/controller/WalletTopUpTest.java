package com.exe101.backend.controller;
import com.exe101.backend.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
@SpringBootTest(properties={"wallet.topup.enabled=true","sepay.webhook-api-key=fixture-key","sepay.gateway=TestBank"})
@AutoConfigureMockMvc
class WalletTopUpTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired UserAccountRepository users; @Autowired JdbcTemplate jdbc;
 String customer(){
   String email=UUID.randomUUID()+"@example.com";
   users.save(new com.exe101.backend.model.UserAccount(email,"unused","Wallet test","CUSTOMER"));return email;
 }
 JsonNode create(String email,int amount,String key)throws Exception{
   return mapper.readTree(mvc.perform(post("/api/user/wallet/topups").with(user(email)).contentType(MediaType.APPLICATION_JSON)
    .content(mapper.writeValueAsString(Map.of("amount",amount,"requestKey",key)))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
 }
 String event(JsonNode t,long id,int amount,String bankCode){
   return mapper.valueToTree(Map.of("id",id,"gateway","TestBank","accountNumber","0000000000","transferType","in",
    "transferAmount",amount,"content","NAP "+t.path("reference").asText()+" YUFIZ","referenceCode",bankCode)).toString();
 }
 @Test void qrIncludesExactAmountMemoAndCreditsOnceAcrossWebhookRetries()throws Exception{
   String email=customer(),key=UUID.randomUUID().toString();var t=create(email,123456,key);
   assertTrue(t.path("qrUrl").asText().contains("amount=123456"));assertTrue(t.path("qrUrl").asText().contains(t.path("reference").asText()));
   assertEquals(t.path("id"),create(email,123456,key).path("id"));
   String code="BANK-"+UUID.randomUUID();String body=event(t,101,123456,code);
   mvc.perform(post("/api/wallet/sepay/webhook").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
   for(int i=0;i<2;i++)mvc.perform(post("/api/wallet/sepay/webhook").header("Authorization","Apikey fixture-key").contentType(MediaType.APPLICATION_JSON).content(body))
    .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
   mvc.perform(post("/api/wallet/sepay/webhook").header("Authorization","Apikey fixture-key").contentType(MediaType.APPLICATION_JSON).content(event(t,102,123456,code))).andExpect(status().isOk());
   assertEquals(0,new BigDecimal("123456").compareTo(users.findByEmail(email).orElseThrow().getWalletBalance()));
   mvc.perform(get("/api/user/wallet").with(user(email))).andExpect(jsonPath("$.transactions.length()").value(1));
   mvc.perform(get("/api/user/wallet/topups/"+t.path("id").asLong()).with(user(email))).andExpect(jsonPath("$.status").value("PAID"));
   mvc.perform(get("/api/user/wallet/topups/"+t.path("id").asLong()).with(user("admin@example.com").roles("ADMIN"))).andExpect(status().isForbidden());
 }
 @Test void mismatchedAmountGoesToReviewWithoutCrediting()throws Exception{
   String email=customer();var t=create(email,100000,UUID.randomUUID().toString());
   mvc.perform(post("/api/wallet/sepay/webhook").header("Authorization","Apikey fixture-key").contentType(MediaType.APPLICATION_JSON).content(event(t,201,90000,"BANK-"+UUID.randomUUID()))).andExpect(status().isOk());
   assertEquals(0,users.findByEmail(email).orElseThrow().getWalletBalance().signum());
   mvc.perform(get("/api/user/wallet/topups/latest").with(user(email))).andExpect(jsonPath("$.status").value("REVIEW"));
   mvc.perform(get("/api/admin/wallet/topup-reviews").with(user("admin@example.com").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$[0].receivedAmount").value(90000));
 }
 @Test void wrongBankOrOutgoingEventDoesNotCreditAndAmountIsValidated()throws Exception{
   String email=customer();var t=create(email,100000,UUID.randomUUID().toString());
   String body=event(t,301,100000,"BANK-"+UUID.randomUUID());
   for(String wrong:new String[]{body.replace("TestBank","OtherBank"),body.replace("0000000000","1111111111"),body.replace("\"in\"","\"out\"")}){
    mvc.perform(post("/api/wallet/sepay/webhook").header("Authorization","Apikey fixture-key").contentType(MediaType.APPLICATION_JSON).content(wrong)).andExpect(status().isOk());
   }
   assertEquals(0,users.findByEmail(email).orElseThrow().getWalletBalance().signum());
   mvc.perform(post("/api/user/wallet/topups").with(user(email)).contentType(MediaType.APPLICATION_JSON).content("{\"amount\":1,\"requestKey\":\"invalid\"}")).andExpect(status().isBadRequest());
   mvc.perform(post("/api/user/wallet/topups").with(user(email)).contentType(MediaType.APPLICATION_JSON).content("{\"amount\":200000,\"requestKey\":\"another\"}")).andExpect(status().isConflict());
 }
 @Test void customerCanCancelPendingAndCreateAnotherAmount()throws Exception{
   String email=customer();var first=create(email,100000,UUID.randomUUID().toString());
   String cancel="/api/user/wallet/topups/"+first.path("id").asLong()+"/cancel";
   mvc.perform(post(cancel).with(user("admin@example.com").roles("ADMIN"))).andExpect(status().isForbidden());
   for(int i=0;i<2;i++)mvc.perform(post(cancel).with(user(email))).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
   var second=create(email,200000,UUID.randomUUID().toString());
   assertNotEquals(first.path("id").asLong(),second.path("id").asLong());
   assertEquals(200000,second.path("amount").asInt());
 }
 @Test void cancelledRequestCannotBeCreditedAutomaticallyWhenMoneyArrivesLate()throws Exception{
   String email=customer();var t=create(email,100000,UUID.randomUUID().toString());
   mvc.perform(post("/api/user/wallet/topups/"+t.path("id").asLong()+"/cancel").with(user(email))).andExpect(status().isOk());
   mvc.perform(post("/api/wallet/sepay/webhook").header("Authorization","Apikey fixture-key").contentType(MediaType.APPLICATION_JSON)
     .content(event(t,401,100000,"BANK-"+UUID.randomUUID()))).andExpect(status().isOk());
   assertEquals(0,users.findByEmail(email).orElseThrow().getWalletBalance().signum());
   mvc.perform(get("/api/user/wallet/topups/"+t.path("id").asLong()).with(user(email))).andExpect(jsonPath("$.status").value("REVIEW"));
 }
 @Test void requestExpiresAfterTenMinutesAndAllowsNewTopUp()throws Exception{
   String email=customer();var old=create(email,100000,UUID.randomUUID().toString());
   assertFalse(old.path("expiresAt").asText().isBlank());
   jdbc.update("update wallet_topups set expires_at=? where id=?",java.sql.Timestamp.valueOf(java.time.LocalDateTime.now().minusSeconds(1)),old.path("id").asLong());
   mvc.perform(get("/api/user/wallet/topups/"+old.path("id").asLong()).with(user(email)))
     .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("EXPIRED"));
   var replacement=create(email,200000,UUID.randomUUID().toString());
   assertNotEquals(old.path("id").asLong(),replacement.path("id").asLong());
 }
}

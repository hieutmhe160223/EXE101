package com.exe101.backend.controller;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest @AutoConfigureMockMvc @Transactional
class PortalControllerTest {
 @Autowired MockMvc mvc; @Autowired EntityManager em; @Autowired UserAccountRepository users;
 @Test void allReadEndpointsReturnDatabaseDataAndProtectAdmin() throws Exception {
   for(String path:new String[]{"/user/profile","/user/wallet","/user/notifications","/user/referrals","/user/sourcing","/user/support"})
     mvc.perform(get("/api"+path).with(user("customer@example.com").roles("CUSTOMER"))).andExpect(status().isOk());
   for(String path:new String[]{"/admin/customers","/admin/vouchers","/admin/reports","/admin/returns","/admin/support","/admin/sourcing","/admin/support/1/messages"}) {
     mvc.perform(get("/api"+path).with(user("customer@example.com").roles("CUSTOMER"))).andExpect(status().isForbidden());
     mvc.perform(get("/api"+path).with(user("admin@example.com").roles("ADMIN"))).andExpect(status().isOk());
   }
   mvc.perform(get("/api/user/profile")).andExpect(status().isUnauthorized());
   mvc.perform(get("/api/user/profile").with(user("customer@example.com"))).andExpect(jsonPath("$.email").value("customer@example.com")).andExpect(jsonPath("$.passwordHash").doesNotExist());
 }
 @Test void sourcingAndSupportPersistAndStayPrivate() throws Exception {
   mvc.perform(post("/api/user/sourcing").with(user("customer@example.com")).contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"Find unique camera\",\"budget\":123456}")).andExpect(status().isOk());
   mvc.perform(get("/api/user/sourcing").with(user("customer@example.com"))).andExpect(jsonPath("$[0].description").value("Find unique camera"));
   mvc.perform(get("/api/user/sourcing").with(user("admin@example.com"))).andExpect(jsonPath("$.length()").value(0));
   mvc.perform(post("/api/user/support").with(user("customer@example.com")).contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"My private question\"}")).andExpect(status().isOk());
   mvc.perform(get("/api/user/support").with(user("customer@example.com"))).andExpect(jsonPath("$[0].message").value("My private question"));
   mvc.perform(get("/api/user/support").with(user("admin@example.com"))).andExpect(jsonPath("$.length()").value(0));
 }
 @Test void addressUpdateAndDeleteAffectOnlyOwner() throws Exception {
   var customer=users.findByEmail("customer@example.com").orElseThrow();
   var address=new UserAddress("Original","0900000000","Original address",false,customer);em.persist(address);em.flush();
   String url="/api/user/addresses/"+address.getId();
   mvc.perform(delete(url).with(user("admin@example.com"))).andExpect(status().isForbidden());
   mvc.perform(put(url).with(user("customer@example.com")).contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"Updated\",\"phone\":\"0911111111\",\"addressDetail\":\"Updated address\",\"isDefault\":true}")).andExpect(status().isOk());
   em.flush();em.clear();
   org.junit.jupiter.api.Assertions.assertEquals("Updated",em.find(UserAddress.class,address.getId()).getFullName());
   mvc.perform(delete(url).with(user("customer@example.com"))).andExpect(status().isOk());em.flush();em.clear();
   org.junit.jupiter.api.Assertions.assertNull(em.find(UserAddress.class,address.getId()));
 }
}

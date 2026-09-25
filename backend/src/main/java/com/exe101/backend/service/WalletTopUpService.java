package com.exe101.backend.service;
import com.exe101.backend.model.*;
import com.exe101.backend.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.*;

@Service @Transactional
public class WalletTopUpService {
 @PersistenceContext EntityManager em;
 private final CurrentUser current;
 private final UserAccountRepository users;
 private final NotificationService notifications;
 @Value("${wallet.topup.enabled:false}") boolean enabled;
 @Value("${wallet.topup.min-amount:10000}") BigDecimal min;
 @Value("${wallet.topup.max-amount:50000000}") BigDecimal max;
 @Value("${wallet.topup.expiry-minutes:10}") long expiryMinutes;
 @Value("${sepay.webhook-api-key:}") String apiKey;
 @Value("${sepay.gateway:}") String gateway;
 @Value("${vietqr.bank-code:}") String bank;
 @Value("${vietqr.account-number:}") String account;
 @Value("${vietqr.account-name:}") String name;
 public WalletTopUpService(CurrentUser current,UserAccountRepository users,NotificationService notifications){this.current=current;this.users=users;this.notifications=notifications;}
 public record View(Long id,BigDecimal amount,String reference,String status,String bankCode,String accountNumber,String accountName,String qrUrl,String message,java.time.OffsetDateTime expiresAt,java.time.LocalDateTime paidAt) {}
 public boolean available(){return enabled&&!apiKey.isBlank()&&!gateway.isBlank()&&!bank.isBlank()&&!account.isBlank()&&!name.isBlank();}
 public Object config(){return Map.of("available",available(),"minAmount",min,"maxAmount",max);}
 public View create(BigDecimal amount,String requestKey){
   if(!available())throw new IllegalStateException("Nạp tiền tự động chưa được cấu hình. Vui lòng thử lại sau.");
   if(amount==null||amount.stripTrailingZeros().scale()>0||amount.compareTo(min)<0||amount.compareTo(max)>0)
     throw new IllegalArgumentException("Số tiền phải là VND nguyên, từ "+min+" đến "+max);
   var user=users.lockById(current.id()).orElseThrow();
   var existing=em.createQuery("select t from WalletTopUp t where t.user.id=:uid and t.requestKey=:key",WalletTopUp.class)
     .setParameter("uid",user.getId()).setParameter("key",requestKey).getResultList();
   if(!existing.isEmpty()){
     expire(existing.get(0));
     if(existing.get(0).amount.compareTo(amount)!=0)throw new IllegalStateException("Yêu cầu này đã được tạo với số tiền khác");
     return view(existing.get(0));
   }
   var pending=em.createQuery("select t from WalletTopUp t where t.user.id=:uid and t.status in ('PENDING','REVIEW') order by t.createdAt desc",WalletTopUp.class)
     .setParameter("uid",user.getId()).setMaxResults(1).getResultList();
   if(!pending.isEmpty()&&expire(pending.get(0)))pending=List.of();
   if(!pending.isEmpty()){
     if(pending.get(0).amount.compareTo(amount)!=0)throw new IllegalStateException("Bạn đang có yêu cầu nạp tiền chưa hoàn tất. Vui lòng kiểm tra yêu cầu hiện tại.");
     return view(pending.get(0));
   }
   var t=new WalletTopUp();t.user=user;t.amount=amount;t.requestKey=requestKey;
   t.reference="YFZ"+UUID.randomUUID().toString().replace("-","").substring(0,20).toUpperCase(Locale.ROOT);
   t.expiresAt=java.time.LocalDateTime.now().plusMinutes(expiryMinutes);
   t.bankCode=bank;t.accountNumber=account;t.accountName=name;em.persist(t);em.flush();return view(t);
 }
 public View latest(){
   var found=em.createQuery("select t from WalletTopUp t where t.user.id=:uid order by t.createdAt desc,t.id desc",WalletTopUp.class)
     .setParameter("uid",current.id()).setMaxResults(1).getResultStream().findFirst();
   if(found.isEmpty())return null;
   var t=em.find(WalletTopUp.class,found.get().id,LockModeType.PESSIMISTIC_WRITE);expire(t);return view(t);
 }
 public View get(Long id){var t=em.find(WalletTopUp.class,id,LockModeType.PESSIMISTIC_WRITE);if(t==null)throw new EntityNotFoundException("Không tìm thấy yêu cầu nạp tiền");current.requireId(t.user.getId());expire(t);return view(t);}
 public View cancel(Long id){
   var t=em.find(WalletTopUp.class,id,LockModeType.PESSIMISTIC_WRITE);
   if(t==null)throw new EntityNotFoundException("Không tìm thấy yêu cầu nạp tiền");
   current.requireId(t.user.getId());
   if(expire(t))return view(t);
   if("CANCELLED".equals(t.status))return view(t);
   if(!"PENDING".equals(t.status))
     throw new IllegalStateException("Yêu cầu đã được thanh toán hoặc đang đối soát nên không thể hủy");
   t.status="CANCELLED";t.message="Bạn đã hủy yêu cầu nạp tiền";em.flush();return view(t);
 }
 private View view(WalletTopUp t){
   String qr=UriComponentsBuilder.fromHttpUrl("https://img.vietqr.io/image/"+t.bankCode+"-"+t.accountNumber+"-compact2.png")
     .queryParam("amount",t.amount.toPlainString()).queryParam("addInfo",t.reference).queryParam("accountName",t.accountName).build().encode().toUriString();
   var expires=t.expiresAt==null?null:t.expiresAt.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
   return new View(t.id,t.amount,t.reference,t.status,t.bankCode,t.accountNumber,t.accountName,qr,t.message,expires,t.paidAt);
 }
 public void receive(String authorization,JsonNode body){
   if(!available()||authorization==null||!MessageDigest.isEqual(("Apikey "+apiKey).getBytes(StandardCharsets.UTF_8),authorization.getBytes(StandardCharsets.UTF_8)))
     throw new BadCredentialsException("Webhook không hợp lệ");
    if(!"in".equals(body.path("transferType").asText()))return;
    String incomingGateway=body.path("gateway").asText("").trim();
    boolean gatewayMatch=gateway.equalsIgnoreCase(incomingGateway)
      ||(gateway.equalsIgnoreCase("MBBank")&&incomingGateway.equalsIgnoreCase("MB"))
      ||(gateway.equalsIgnoreCase("MB")&&incomingGateway.equalsIgnoreCase("MBBank"));
    if(!gatewayMatch||!account.equals(body.path("accountNumber").asText("").trim()))return;
   String content=body.path("content").asText("").toUpperCase(Locale.ROOT);
   var matcher=Pattern.compile("(?<![A-Z0-9])YFZ[A-F0-9]{20}(?![A-Z0-9])").matcher(content);
   if(!matcher.find())return;String reference=matcher.group();if(matcher.find())throw new IllegalArgumentException("Nội dung chứa nhiều mã nạp");
   var list=em.createQuery("select t from WalletTopUp t where t.reference=:ref",WalletTopUp.class).setParameter("ref",reference).getResultList();
   if(list.isEmpty())return;
   String id=body.path("id").asText(),code=body.path("referenceCode").asText();
   if(!id.matches("[1-9][0-9]{0,18}")||code.isBlank()||code.length()>100)throw new IllegalArgumentException("Thiếu mã giao dịch ngân hàng");
   BigDecimal received;
   try{received=new BigDecimal(body.path("transferAmount").asText());}catch(Exception ex){throw new IllegalArgumentException("Số tiền không hợp lệ");}
   if(received.signum()<=0||received.stripTrailingZeros().scale()>0||received.precision()>15)throw new IllegalArgumentException("Số tiền không hợp lệ");
   var user=users.lockById(list.get(0).user.getId()).orElseThrow();
   var t=em.find(WalletTopUp.class,list.get(0).id,LockModeType.PESSIMISTIC_WRITE);expire(t);
   String bankRef=gateway.toUpperCase(Locale.ROOT)+":"+account+":"+code;
   var previous=em.find(WalletBankReceipt.class,"SEPAY:"+id);
   if(previous!=null){
     if(!previous.topUp.id.equals(t.id)||previous.amount.compareTo(received)!=0||!previous.bankReference.equals(bankRef))throw new IllegalStateException("Giao dịch đã được ghi nhận với dữ liệu khác");
     return;
   }
   var duplicate=em.createQuery("select r from WalletBankReceipt r where r.bankReference=:ref",WalletBankReceipt.class).setParameter("ref",bankRef).getResultList();
   if(!duplicate.isEmpty()){
     if(!duplicate.get(0).topUp.id.equals(t.id)||duplicate.get(0).amount.compareTo(received)!=0)throw new IllegalStateException("Mã ngân hàng đã được sử dụng");
     return;
   }
   var receipt=new WalletBankReceipt();receipt.id="SEPAY:"+id;receipt.bankReference=bankRef;receipt.topUp=t;receipt.amount=received;
   if(!t.accountNumber.equals(account)||!"PENDING".equals(t.status)||received.compareTo(t.amount)!=0){
     receipt.status="REVIEW";receipt.note="Số tiền không khớp hoặc yêu cầu không còn chờ. Cần đối soát thủ công.";
     if(!"PAID".equals(t.status)){t.status="REVIEW";t.message="Đã nhận thông báo chuyển tiền nhưng cần đối soát. Vui lòng liên hệ hỗ trợ, không chuyển thêm.";}
   }else{
     receipt.status="CREDITED";BigDecimal balanceBefore=user.getWalletBalance()==null?BigDecimal.ZERO:user.getWalletBalance();user.creditWallet(received);t.status="PAID";t.paidAt=java.time.LocalDateTime.now();t.message="Đã cộng tiền vào ví Yufiz";
     em.persist(new WalletTransaction(user,WalletTransactionType.TOP_UP,received,"Nạp tiền VietQR "+t.reference,
       "TOPUP:"+t.id,null,balanceBefore,user.getWalletBalance()));
     notifications.create(user,NotificationType.WALLET,"Nạp tiền thành công",
       received.toPlainString()+" VND đã được cộng vào Ví Yufiz.","/wallet","TOPUP:"+t.id+":PAID");
   }
   em.persist(receipt);em.flush();
 }
 public Object reviews(){
   return em.createQuery("select new map(r.id as id,r.topUp.user.email as email,r.topUp.reference as reference,r.topUp.amount as expectedAmount,r.amount as receivedAmount,r.bankReference as bankReference,r.note as note,r.createdAt as createdAt) from WalletBankReceipt r where r.status='REVIEW' order by r.createdAt desc").setMaxResults(200).getResultList();
 }
 public int expireOverdue(){
   return em.createQuery("update WalletTopUp t set t.status='EXPIRED',t.message=:message where t.status='PENDING' and t.expiresAt is not null and t.expiresAt<=:now")
     .setParameter("message","Yêu cầu nạp tiền đã hết hạn sau "+expiryMinutes+" phút")
     .setParameter("now",java.time.LocalDateTime.now()).executeUpdate();
 }
 private boolean expire(WalletTopUp t){
   if("PENDING".equals(t.status)&&t.expiresAt==null&&t.getCreatedAt()!=null)t.expiresAt=t.getCreatedAt().plusMinutes(expiryMinutes);
   if("PENDING".equals(t.status)&&t.expiresAt!=null&&!t.expiresAt.isAfter(java.time.LocalDateTime.now())){
     t.status="EXPIRED";t.message="Yêu cầu nạp tiền đã hết hạn sau "+expiryMinutes+" phút";return true;
   }
   return false;
 }
}

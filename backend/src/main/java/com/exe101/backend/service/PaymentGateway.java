package com.exe101.backend.service;
import com.exe101.backend.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.util.*;

@Service
public class PaymentGateway {
    @Value("${momo.partner-code:}") private String momoPartner;
    @Value("${momo.access-key:}") private String momoAccess;
    @Value("${momo.secret-key:}") private String momoSecret;
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}") private String momoEndpoint;
    @Value("${momo.ipn-url:}") private String momoCallback;
    @Value("${momo.query-endpoint:https://test-payment.momo.vn/v2/gateway/api/query}") private String momoQueryEndpoint;
    @Value("${zalopay.app-id:}") private String zaloApp;
    @Value("${zalopay.key1:}") private String zaloKey1;
    @Value("${zalopay.key2:}") private String zaloKey2;
    @Value("${zalopay.endpoint:https://sb-openapi.zalopay.vn/v2/create}") private String zaloEndpoint;
    @Value("${zalopay.callback-url:}") private String zaloCallback;
    @Value("${zalopay.query-endpoint:https://sb-openapi.zalopay.vn/v2/query}") private String zaloQueryEndpoint;
    @Value("${app.frontend-url:http://localhost:5173}") private String frontend;
    @Value("${vietqr.bank-code:}") private String bankCode;
    @Value("${vietqr.account-number:}") private String bankAccount;
    @Value("${vietqr.account-name:}") private String bankName;
    private final ObjectMapper mapper;
    private final RestTemplate http = new RestTemplateBuilder().setConnectTimeout(Duration.ofSeconds(5)).setReadTimeout(Duration.ofSeconds(30)).build();
    public PaymentGateway(ObjectMapper mapper) { this.mapper = mapper; }
    public boolean available(PaymentMethod method) {
        return switch(method) {
            case BANK_TRANSFER -> !bankCode.isBlank() && !bankAccount.isBlank() && !bankName.isBlank();
            case MOMO -> !momoPartner.isBlank() && !momoAccess.isBlank() && !momoSecret.isBlank() && !momoCallback.isBlank();
            case ZALOPAY -> !zaloApp.isBlank() && !zaloKey1.isBlank() && !zaloKey2.isBlank() && !zaloCallback.isBlank();
            default -> false;
        };
    }
    public record Instructions(String qrUrl, String payUrl, String bankCode, String accountNumber, String accountName, String transferContent) {}
    public static class Declined extends IllegalStateException { public Declined(String message) { super(message); } }
    public Instructions create(PaymentTransaction payment) {
        if (!available(payment.getMethod())) throw new IllegalStateException("Phương thức chưa được cấu hình");
        String reference = payment.getMerchantReference();
        long amount = payment.getAmountVnd().longValueExact();
        String redirect = frontend + "/order/success?orderId=" + payment.getOrder().getId()
                + (payment.getType()==PaymentType.FINAL_30 ? "&phase=final" : "");
        String description=(payment.getType()==PaymentType.FINAL_30 ? "Thanh toan con lai " : "Dat coc ")+payment.getOrder().getOrderCode();
        if (payment.getMethod() == PaymentMethod.BANK_TRANSFER) {
            String qr = UriComponentsBuilder.fromHttpUrl("https://img.vietqr.io/image/" + bankCode + "-" + bankAccount + "-compact.png")
                    .queryParam("amount", amount).queryParam("addInfo", reference).queryParam("accountName", bankName).build().encode().toUriString();
            return new Instructions(qr, null, bankCode, bankAccount, bankName, reference);
        }
        Map<String,Object> body = new LinkedHashMap<>();
        if (payment.getMethod() == PaymentMethod.MOMO) {
            body.put("partnerCode", momoPartner); body.put("requestId", reference); body.put("amount", amount);
            body.put("orderId", reference); body.put("orderInfo", description);
            body.put("redirectUrl", redirect); body.put("ipnUrl", momoCallback); body.put("extraData", "");
            body.put("requestType", "captureWallet"); body.put("lang", "vi"); body.put("autoCapture", true);
            String raw = "accessKey=" + momoAccess + "&amount=" + amount + "&extraData=&ipnUrl=" + momoCallback
                    + "&orderId=" + reference + "&orderInfo=" + body.get("orderInfo") + "&partnerCode=" + momoPartner
                    + "&redirectUrl=" + redirect + "&requestId=" + reference + "&requestType=captureWallet";
            body.put("signature", hmac(raw, momoSecret));
            JsonNode result = post(momoEndpoint, body);
            if (result.path("resultCode").asInt(-1) != 0 || result.path("payUrl").asText().isBlank())
                throw new Declined("MoMo chưa tạo được giao dịch. Vui lòng thử lại sau.");
            return new Instructions(null, safePayUrl(result.path("payUrl").asText()), null, null, null, null);
        }
        String embed;
        try { embed = mapper.writeValueAsString(Map.of("redirecturl", redirect, "preferred_payment_method", List.of("zalopay_wallet"))); }
        catch (Exception ex) { throw new IllegalStateException(ex); }
        body.put("app_id", Integer.parseInt(zaloApp)); body.put("app_user", payment.getPayer().getId().toString());
        body.put("app_trans_id", reference); body.put("app_time", System.currentTimeMillis()); body.put("amount", amount);
        body.put("description", description); body.put("callback_url", zaloCallback);
        body.put("item", "[]"); body.put("embed_data", embed); body.put("bank_code", "");
        String raw = zaloApp + "|" + reference + "|" + body.get("app_user") + "|" + amount + "|" + body.get("app_time") + "|" + embed + "|[]";
        body.put("mac", hmac(raw, zaloKey1));
        JsonNode result = post(zaloEndpoint, body);
        if (result.path("return_code").asInt() != 1 || result.path("order_url").asText().isBlank())
            throw new Declined("ZaloPay chưa tạo được giao dịch. Vui lòng thử lại sau.");
        return new Instructions(null, safePayUrl(result.path("order_url").asText()), null, null, null, null);
    }
    private JsonNode post(String url, Map<String,Object> body) {
        HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
        JsonNode result = http.postForObject(url, new HttpEntity<>(body, headers), JsonNode.class);
        if (result == null) throw new IllegalStateException("Không có phản hồi từ cổng thanh toán");
        return result;
    }
    private String safePayUrl(String value) {
        var uri = java.net.URI.create(value);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null || uri.getUserInfo() != null)
            throw new IllegalStateException("Đường dẫn thanh toán không hợp lệ");
        return value;
    }
    public record VerifiedPayment(String reference, BigDecimal amount, String transactionCode, boolean paid) {}
    // A non-successful query can mean processing or a request error. Keep it pending until confirmed.
    public Optional<VerifiedPayment> query(PaymentTransaction payment) {
        if(!available(payment.getMethod())) throw new IllegalStateException("Phương thức chưa được cấu hình");
        String ref=payment.getMerchantReference();
        if(ref==null) throw new IllegalStateException("Giao dịch cũ thiếu mã tra soát");
        JsonNode result;
        if(payment.getMethod()==PaymentMethod.MOMO) {
            String requestId=UUID.randomUUID().toString();
            result=post(momoQueryEndpoint,Map.of("partnerCode",momoPartner,"requestId",requestId,"orderId",ref,"lang","vi",
                    "signature",hmac("accessKey="+momoAccess+"&orderId="+ref+"&partnerCode="+momoPartner,momoSecret)));
            if(result.path("resultCode").asInt(-1)!=0) return Optional.empty();
            if(!ref.equals(result.path("orderId").asText()) || !momoPartner.equals(result.path("partnerCode").asText())
                    || !requestId.equals(result.path("requestId").asText())) throw new IllegalStateException("Phản hồi tra soát không khớp giao dịch");
            return Optional.of(new VerifiedPayment(ref,new BigDecimal(result.path("amount").asText()),result.path("transId").asText(),true));
        }
        if(payment.getMethod()!=PaymentMethod.ZALOPAY) throw new IllegalArgumentException("Chuyển khoản cần admin đối soát sao kê");
        result=post(zaloQueryEndpoint,Map.of("app_id",Integer.parseInt(zaloApp),"app_trans_id",ref,
                "mac",hmac(zaloApp+"|"+ref+"|"+zaloKey1,zaloKey1)));
        if(result.path("return_code").asInt()!=1 || result.path("is_processing").asBoolean(true)) return Optional.empty();
        return Optional.of(new VerifiedPayment(ref,new BigDecimal(result.path("amount").asText()),result.path("zp_trans_id").asText(),true));
    }
    public VerifiedPayment verifyMomo(JsonNode data) {
        if (!available(PaymentMethod.MOMO) || !momoPartner.equals(data.path("partnerCode").asText()))
            throw new IllegalArgumentException("Thông tin MoMo không hợp lệ");
        String raw = "accessKey=" + momoAccess;
        for (String name : List.of("amount", "extraData", "message", "orderId", "orderInfo", "orderType", "partnerCode", "payType", "requestId", "responseTime", "resultCode", "transId"))
            raw += "&" + name + "=" + data.path(name).asText();
        verify(raw, momoSecret, data.path("signature").asText());
        if (!data.path("orderId").asText().equals(data.path("requestId").asText())) throw new IllegalArgumentException("Mã request không khớp");
        return new VerifiedPayment(data.path("orderId").asText(), new BigDecimal(data.path("amount").asText()),
                data.path("transId").asText(), data.path("resultCode").asInt(-1) == 0);
    }
    public VerifiedPayment verifyZalo(JsonNode envelope) {
        if (!available(PaymentMethod.ZALOPAY)) throw new IllegalArgumentException("ZaloPay chưa cấu hình");
        String raw = envelope.path("data").asText();
        verify(raw, zaloKey2, envelope.path("mac").asText());
        try {
            JsonNode data = mapper.readTree(raw);
            if (!zaloApp.equals(data.path("app_id").asText())) throw new IllegalArgumentException("Sai ứng dụng");
            return new VerifiedPayment(data.path("app_trans_id").asText(), new BigDecimal(data.path("amount").asText()),
                    data.path("zp_trans_id").asText(), true);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) { throw new IllegalArgumentException("Callback không hợp lệ"); }
    }
    private void verify(String raw, String key, String signature) {
        if (key.isBlank() || !MessageDigest.isEqual(hmac(raw, key).getBytes(StandardCharsets.UTF_8), signature.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8)))
            throw new IllegalArgumentException("Chữ ký thanh toán không hợp lệ");
    }
    static String hmac(String raw, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) { throw new IllegalStateException("Không tạo được chữ ký", ex); }
    }
}

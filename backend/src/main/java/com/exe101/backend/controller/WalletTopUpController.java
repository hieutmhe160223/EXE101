package com.exe101.backend.controller;
import com.exe101.backend.service.WalletTopUpService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api")
public class WalletTopUpController {
 private final WalletTopUpService service;
 public WalletTopUpController(WalletTopUpService service){this.service=service;}
 public record Request(@NotNull BigDecimal amount,@NotBlank @Size(max=80) String requestKey){}
 @GetMapping("/user/wallet/topups/config") public Object config(){return service.config();}
 @PostMapping("/user/wallet/topups") public Object create(@Valid @RequestBody Request body){return service.create(body.amount(),body.requestKey());}
 @GetMapping("/user/wallet/topups/latest") public ResponseEntity<?> latest(){var result=service.latest();return result==null?ResponseEntity.noContent().build():ResponseEntity.ok(result);}
 @GetMapping("/user/wallet/topups/{id}") public Object get(@PathVariable Long id){return service.get(id);}
 @PostMapping("/user/wallet/topups/{id}/cancel") public Object cancel(@PathVariable Long id){return service.cancel(id);}
 @PostMapping("/wallet/sepay/webhook") public Object webhook(@RequestHeader(value="Authorization",required=false) String authorization,@RequestBody JsonNode body){service.receive(authorization,body);return Map.of("success",true);}
 @GetMapping("/admin/wallet/topup-reviews") public Object reviews(){return service.reviews();}
}

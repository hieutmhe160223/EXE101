package com.exe101.backend.controller;

import com.exe101.backend.model.OrderStatus;
import com.exe101.backend.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController @Validated @RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final OrderService orders;
    public AdminOrderController(OrderService orders) { this.orders=orders; }
    public record Transition(@NotNull OrderStatus expectedStatus, @NotNull OrderStatus status,
            @Size(max=200) String location, @NotBlank @Size(max=1000) String note) {}
    @GetMapping public Object list(@RequestParam(defaultValue="0") @Min(0) int page) {
        var result=orders.adminList(page);
        return java.util.Map.of("content",result.getContent(),"totalPages",result.getTotalPages(),"totalElements",result.getTotalElements(),"number",result.getNumber());
    }
    @GetMapping("/{id}") public Object detail(@PathVariable Long id) { return orders.adminDetail(id); }
    @PostMapping("/{id}/status") public Object advance(@PathVariable Long id,@Valid @RequestBody Transition body) {
        return orders.advance(id,body.expectedStatus(),body.status(),body.location(),body.note());
    }
}

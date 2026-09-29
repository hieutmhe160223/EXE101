package com.exe101.backend.controller;

import com.exe101.backend.model.SourcingRequest;
import com.exe101.backend.service.CurrentUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Transactional
public class PortalController {
    @PersistenceContext EntityManager em;
    private final CurrentUser user;

    public PortalController(CurrentUser user) { this.user = user; }

    private List<?> rows(String hql, boolean scoped) {
        var query = em.createQuery(hql);
        if (scoped) query.setParameter("uid", user.id());
        return query.setMaxResults(200).getResultList();
    }

    @GetMapping("/user/profile") public Object profile() {
        return rows("select new map(u.id as id,u.email as email,u.fullName as fullName,u.phoneNumber as phoneNumber,u.walletBalance as walletBalance,u.loyaltyPoints as loyaltyPoints,u.referralCode as referralCode) from UserAccount u where u.id=:uid", true).get(0);
    }
    @GetMapping("/user/wallet") public Object wallet() {
        return Map.of("profile", profile(),
                "transactions", rows("select new map(t.id as id,t.type as type,t.amountVnd as amount,t.description as description,t.reference as reference,t.balanceBefore as balanceBefore,t.balanceAfter as balanceAfter,o.orderCode as orderCode,t.createdAt as createdAt) from WalletTransaction t left join t.order o where t.user.id=:uid order by t.createdAt desc", true),
                "vouchers", rows("select new map(v.id as id,v.voucher.code as code,v.voucher.name as name,v.usedAt as usedAt,v.voucher.endsAt as endsAt) from UserVoucher v where v.user.id=:uid order by v.createdAt desc", true));
    }
    @GetMapping("/user/referrals") public Object referrals() {
        return Map.of("profile", profile(), "items", rows("select new map(r.id as id,r.referredUser.fullName as name,r.rewardAmountVnd as reward,r.rewarded as rewarded,r.createdAt as createdAt) from Referral r where r.referrer.id=:uid order by r.createdAt desc", true));
    }
    @GetMapping("/admin/customers") public Object customers() {
        return rows("select new map(u.id as id,u.fullName as fullName,u.email as email,u.phoneNumber as phoneNumber,u.walletBalance as walletBalance,u.status as status) from UserAccount u where u.role='CUSTOMER' order by u.createdAt desc", false);
    }
    @GetMapping("/admin/vouchers") public Object vouchers() {
        return rows("select new map(v.id as id,v.code as code,v.name as name,v.discountValue as discountValue,v.percentage as percentage,v.minimumOrderVnd as minimumOrderVnd,v.endsAt as endsAt,v.active as active) from Voucher v order by v.createdAt desc", false);
    }
    @GetMapping("/admin/reports") public Object reports() {
        return Map.of("orders", em.createQuery("select count(o) from PurchaseOrder o").getSingleResult(),
                "customers", em.createQuery("select count(u) from UserAccount u where u.role='CUSTOMER'").getSingleResult(),
                "received", em.createQuery("select coalesce(sum(o.paidAmountVnd),0) from PurchaseOrder o").getSingleResult(),
                "statuses", rows("select new map(o.status as status,count(o) as count) from PurchaseOrder o group by o.status", false),
                "channels", rows("select new map(r.id as id,r.channelName as channel,r.reportDate as date,r.ordersCount as orders,r.revenueVnd as revenue,r.marketingCostVnd as cost) from MarketingChannelReport r order by r.reportDate desc", false));
    }
    @GetMapping("/admin/returns") public Object returns() {
        return rows("select new map(r.id as id,r.order.id as orderId,r.order.orderCode as orderCode,r.customer.email as customerEmail,r.customer.fullName as customerName,r.reason as reason,r.evidenceUrl as evidenceUrl,r.status as status,r.requestedAmountVnd as requestedAmountVnd,r.approvedAmountVnd as approvedAmountVnd,r.order.paidAmountVnd as paidAmountVnd,r.order.refundedAmountVnd as refundedAmountVnd,r.adminNote as adminNote,r.reviewedAt as reviewedAt,r.createdAt as createdAt) from ReturnRequest r order by r.createdAt desc", false);
    }

    public record SourcingBody(@NotBlank @Size(max = 5000) String description,
                               @DecimalMin("0") java.math.BigDecimal budget) {}
    @GetMapping("/user/sourcing") public Object sourcing() {
        return rows("select new map(s.id as id,s.requirementDescription as description,s.expectedBudgetVnd as budget,s.status as status,s.createdAt as createdAt) from SourcingRequest s where s.customer.id=:uid order by s.createdAt desc", true);
    }
    @PostMapping("/user/sourcing") public void source(@Valid @RequestBody SourcingBody body) {
        em.persist(new SourcingRequest(user.get(), body.description(), body.budget()));
    }
    @GetMapping("/admin/sourcing") public Object sourcingInbox() {
        return rows("select new map(s.id as id,s.customer.fullName as customer,s.requirementDescription as description,s.expectedBudgetVnd as budget,s.status as status) from SourcingRequest s order by s.createdAt desc", false);
    }
}

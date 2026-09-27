package com.exe101.backend.service;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;
@Component @EnableScheduling
public class WalletTopUpExpiryJob {
 private final WalletTopUpService service;
 public WalletTopUpExpiryJob(WalletTopUpService service){this.service=service;}
 @Scheduled(fixedDelay=15000,initialDelay=15000)
 public void expire(){service.expireOverdue();}
}

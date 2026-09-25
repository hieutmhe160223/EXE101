package com.exe101.backend.service;
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
@Service
public class CurrentUser {
    private final UserAccountRepository repository;
    public CurrentUser(UserAccountRepository repository) { this.repository = repository; }
    public UserAccount get() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new BadCredentialsException("Vui lòng đăng nhập");
        return repository.findByEmail(auth.getName()).orElseThrow(() -> new BadCredentialsException("Phiên không hợp lệ"));
    }
    public Long id() { return get().getId(); }
    public void requireId(Long id) {
        if (!id().equals(id)) throw new AccessDeniedException("Bạn không có quyền truy cập dữ liệu này");
    }
    public void requireEmail(String email) {
        if (!get().getEmail().equalsIgnoreCase(email)) throw new AccessDeniedException("Bạn không có quyền truy cập dữ liệu này");
    }
}

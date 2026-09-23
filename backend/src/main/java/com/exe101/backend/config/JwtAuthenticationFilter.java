package com.exe101.backend.config;

import com.exe101.backend.model.AccountStatus; // Import enum AccountStatus
import com.exe101.backend.model.UserAccount;
import com.exe101.backend.repository.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserAccountRepository userRepository; // Bổ sung repository để truy vấn DB

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        
        try {
            String email = jwtService.extractEmail(jwt);
            String role = jwtService.extractRole(jwt);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // --- BỔ SUNG: KIỂM TRA TRẠNG THÁI TRONG DB DÙ ĐÃ CÓ TOKEN ---
                Optional<UserAccount> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    UserAccount user = userOpt.get();
                    if (user.getStatus() == AccountStatus.LOCKED || user.getStatus() == AccountStatus.DISABLED) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 Forbidden
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"message\": \"Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa!\"}");
                        return; // Chặn không cho đi tiếp
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                // -------------------------------------------------------------
                
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, 
                        null, 
                        Collections.singletonList(authority)
                );
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Token không hợp lệ hoặc hết hạn
        }

        filterChain.doFilter(request, response);
    }
}
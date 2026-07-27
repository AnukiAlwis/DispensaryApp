package com.anucode.dispensary.filters;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.services.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip JWT validation for auth endpoints and H2 console
        if (path.startsWith("/h2-console") || path.startsWith("/error") || path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Authorization header
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // Validate token and extract claims
            UUID userId = jwtTokenService.extractUserId(token);
            UUID tenantId = jwtTokenService.extractTenantId(token);
            String role = jwtTokenService.extractRole(token);

            // Set tenant context
            TenantContext.setTenantId(tenantId.toString());
            TenantContext.setCurrentUser(userId);

            // Create authentication token
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // Invalid token - clear context and continue
            SecurityContextHolder.clearContext();
            TenantContext.clear();
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear tenant context after request
            TenantContext.clear();
        }
    }
}

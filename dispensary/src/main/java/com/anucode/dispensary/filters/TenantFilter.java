package com.anucode.dispensary.filters;

import com.anucode.dispensary.config.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class TenantFilter extends HttpFilter {

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String path = request.getRequestURI();
        if (path.startsWith("/h2-console") || path.startsWith("/error") || path.startsWith("/tenants")) {
            chain.doFilter(request, response);
            return;
        }

        String tenantId = request.getHeader("X-Tenant-ID");

        if (tenantId == null || tenantId.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "X-Tenant-ID header is missing");
            return;
        }

        try {
            // Validate UUID format
            UUID.fromString(tenantId);
        } catch (IllegalArgumentException ex) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid X-Tenant-ID");
            return;
        }

        // Set tenant in ThreadLocal
        TenantContext.setTenantId(tenantId);

        // Set current user from X-User-ID header (MVP: header-based identity)
        String userIdHeader = request.getHeader("X-User-ID");
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            TenantContext.setCurrentUser(UUID.fromString(userIdHeader));
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // Clear tenant after request processing
            TenantContext.clear();
        }
    }
}

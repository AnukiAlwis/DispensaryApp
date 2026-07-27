package com.anucode.dispensary.filters;

import com.anucode.dispensary.config.TenantContext;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.services.TenantService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TenantFilter extends HttpFilter {

    private final TenantService tenantService;

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String path = request.getRequestURI();
        if (path.startsWith("/h2-console") || path.startsWith("/error") || path.startsWith("/tenants") || path.startsWith("/api/auth")) {
            chain.doFilter(request, response);
            return;
        }

        // Extract subdomain from request host
        String host = request.getServerName();
        String subdomain = extractSubdomain(host);

        // If subdomain is null (localhost), skip tenant derivation (login endpoint handles this)
        if (subdomain != null) {
            Optional<Tenant> tenantOpt = tenantService.findByCode(subdomain);
            if (tenantOpt.isEmpty()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unknown tenant");
                return;
            }
            TenantContext.setTenantId(tenantOpt.get().getId().toString());
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // Clear tenant after request processing
            TenantContext.clear();
        }
    }

    private String extractSubdomain(String host) {
        if (host.equals("localhost") || host.equals("127.0.0.1")) {
            return null; // Localhost uses tenantCode from login request
        }
        String[] parts = host.split("\\.");
        return parts[0]; // Extract first part as subdomain
    }
}

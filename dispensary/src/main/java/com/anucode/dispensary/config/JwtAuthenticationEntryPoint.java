package com.anucode.dispensary.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, 
                         HttpServletResponse response, 
                         AuthenticationException authException) throws IOException {
        
        // This ensures ANY unauthenticated access (expired token, missing token, invalid signature)
        // returns a 401 Unauthorized instead of Spring's default 403.
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized access or expired token");
    }
}
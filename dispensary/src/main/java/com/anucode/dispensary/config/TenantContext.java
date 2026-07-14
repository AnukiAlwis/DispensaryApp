package com.anucode.dispensary.config;

import java.util.UUID;

public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();
    private static final ThreadLocal<UUID> currentUser = new ThreadLocal<>();

    // Set Tenant ID
    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        return currentTenant.get();
    }

    // Set Current User (for MVP, hardcoded if not provided)
    public static void setCurrentUser(UUID userId) {
        currentUser.set(userId);
    }

    public static UUID getCurrentUser() {
        UUID userId = currentUser.get();
        if (userId == null) {
            // Phase 1 default hardcoded user
            return UUID.fromString("3c2c95c5-db0d-42e9-86de-b02cfecddbda");
        }
        return userId;
    }

    // Clear both
    public static void clear() {
        currentTenant.remove();
        currentUser.remove();
    }
}


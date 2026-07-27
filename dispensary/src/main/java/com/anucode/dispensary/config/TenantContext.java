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

    // Set Current User (must come from JWT authentication)
    public static void setCurrentUser(UUID userId) {
        currentUser.set(userId);
    }

    public static UUID getCurrentUser() {
        return currentUser.get();
    }

    // Clear both
    public static void clear() {
        currentTenant.remove();
        currentUser.remove();
    }
}


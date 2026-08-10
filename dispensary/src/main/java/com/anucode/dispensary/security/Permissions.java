package com.anucode.dispensary.security;

public final class Permissions {

    private Permissions() {}

    // Patients feature permissions
    public static final String PATIENT_VIEW = "PATIENT_VIEW";
    public static final String PATIENT_EDIT = "PATIENT_EDIT";
    public static final String PATIENT_DELETE = "PATIENT_DELETE";

    // Consults feature permissions
    public static final String CONSULT_VIEW = "CONSULT_VIEW";
    public static final String CONSULT_CREATE = "CONSULT_CREATE";
    public static final String CONSULT_EDIT = "CONSULT_EDIT";

    // Dispensing feature permissions
    public static final String PRESCRIPTION_DISPENSE = "PRESCRIPTION_DISPENSE";
    public static final String PRESCRIPTION_VIEW = "PRESCRIPTION_VIEW";

    // Pharmacy feature permissions
    public static final String PHARMACY_MANAGE = "PHARMACY_MANAGE";
    public static final String PHARMACY_VIEW = "PHARMACY_VIEW";

    // Queues feature permissions
    public static final String QUEUE_MANAGE = "QUEUE_MANAGE";
    public static final String QUEUE_VIEW = "QUEUE_VIEW";
    public static final String QUEUE_CHECKIN = "QUEUE_CHECKIN";

    // Visits feature permissions
    public static final String VISIT_VIEW = "VISIT_VIEW";
    public static final String VISIT_EDIT = "VISIT_EDIT";

    // Users feature permissions
    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String USER_VIEW = "USER_VIEW";

    // Role management permission
    public static final String ROLE_MANAGE = "ROLE_MANAGE";

    // Billing feature permissions
    public static final String BILL_VIEW = "BILL_VIEW";
    public static final String BILL_MANAGE = "BILL_MANAGE";

    // Discounts feature permissions
    public static final String DISCOUNTS_ADD = "DISCOUNTS_ADD";
}

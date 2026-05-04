package com.anucode.dispensary.exception;

public class PrescriptionItemNotFoundException extends RuntimeException {
    public PrescriptionItemNotFoundException(String message) {
        super(message);
    }
}

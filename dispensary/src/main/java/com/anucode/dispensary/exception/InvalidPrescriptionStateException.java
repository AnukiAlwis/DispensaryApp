package com.anucode.dispensary.exception;

public class InvalidPrescriptionStateException extends RuntimeException {
    public InvalidPrescriptionStateException(String message) {
        super(message);
    }
}

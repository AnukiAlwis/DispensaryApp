package com.anucode.dispensary.exception;

public class DispenseNotFoundException extends RuntimeException {
    public DispenseNotFoundException(String message) {
        super(message);
    }
}

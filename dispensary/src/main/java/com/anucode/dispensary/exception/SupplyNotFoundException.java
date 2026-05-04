package com.anucode.dispensary.exception;

public class SupplyNotFoundException extends RuntimeException {
    public SupplyNotFoundException(String message) {
        super(message);
    }
}

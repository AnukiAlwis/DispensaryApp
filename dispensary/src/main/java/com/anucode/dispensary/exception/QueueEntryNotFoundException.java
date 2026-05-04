package com.anucode.dispensary.exception;

public class QueueEntryNotFoundException extends RuntimeException{
    public QueueEntryNotFoundException(String message) {
        super(message);
    }
}

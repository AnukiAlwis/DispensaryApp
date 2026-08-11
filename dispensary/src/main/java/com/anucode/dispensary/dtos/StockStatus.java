package com.anucode.dispensary.dtos;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum StockStatus {
    ALL,
    REORDER_NEEDED,
    UNAVAILABLE,
    IN_STOCK;

    public static List<StockStatus> fromString(String stockStatusString) {
        if (stockStatusString == null || stockStatusString.trim().isEmpty()) {
            return List.of(ALL);
        }

        return Arrays.stream(stockStatusString.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .map(StockStatus::valueOf)
                .collect(Collectors.toList());
    }
}

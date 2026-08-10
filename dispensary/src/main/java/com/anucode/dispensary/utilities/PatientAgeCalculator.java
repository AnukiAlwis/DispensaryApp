package com.anucode.dispensary.utilities;

import java.time.LocalDate;
import java.time.Period;

public final class PatientAgeCalculator {

    private PatientAgeCalculator() {
    }

    /**
     * Calculates the age based on the provided date of birth.
     * Returns formatted string showing years, months, or days depending on age.
     * @param dob The patient's date of birth (LocalDate).
     * @return Formatted age string (e.g., "25 yrs", "8 mos", "15 days"), or null if dob is null.
     */
    public static String calculateAge(LocalDate dob) {
        if (dob == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        Period period = Period.between(dob, today);

        // If the patient is 1 year or older, show years
        if (period.getYears() >= 1) {
            return period.getYears() + " yrs";
        }

        // If the patient is 1 month or older but less than 1 year, show months
        if (period.getMonths() >= 1) {
            return period.getMonths() + " mos";
        }

        // If less than 1 month, show days
        return period.getDays() + " days";
    }
}

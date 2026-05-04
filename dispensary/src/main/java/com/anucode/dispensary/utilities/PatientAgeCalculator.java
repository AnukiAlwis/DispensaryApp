package com.anucode.dispensary.utilities;

import java.time.LocalDate;
import java.time.Period;

public final class PatientAgeCalculator {

    private PatientAgeCalculator() {
    }

    /**
     * Calculates the age in years based on the provided date of birth.
     * @param dob The patient's date of birth (LocalDate).
     * @return The age in full years, or null if dob is null or in the future.
     */
    public static Integer calculateAge(LocalDate dob) {
        if (dob == null) {
            return null;
        }

        LocalDate today = LocalDate.now();

        // Ensure DOB is not in the future
        if (dob.isAfter(today)) {
            return 0;
        }

        return Period.between(dob, today).getYears();
    }
}

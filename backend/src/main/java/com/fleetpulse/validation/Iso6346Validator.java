package com.fleetpulse.validation;

import java.util.Map;

public class Iso6346Validator {

    private static final Map<Character, Integer> CHAR_VALUES = Map.ofEntries(
        Map.entry('A', 10), Map.entry('B', 12), Map.entry('C', 13), Map.entry('D', 14),
        Map.entry('E', 15), Map.entry('F', 16), Map.entry('G', 17), Map.entry('H', 18),
        Map.entry('I', 19), Map.entry('J', 20), Map.entry('K', 21), Map.entry('L', 23),
        Map.entry('M', 24), Map.entry('N', 25), Map.entry('O', 26), Map.entry('P', 27),
        Map.entry('Q', 28), Map.entry('R', 29), Map.entry('S', 30), Map.entry('T', 31),
        Map.entry('U', 32), Map.entry('V', 34), Map.entry('W', 35), Map.entry('X', 36),
        Map.entry('Y', 37), Map.entry('Z', 38)
    );

    public static boolean isValid(String containerNumber) {
        if (containerNumber == null) return false;
        String clean = containerNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (clean.length() != 11) return false;

        int sum = 0;
        for (int i = 0; i < 10; i++) {
            char ch = clean.charAt(i);
            int value;
            if (Character.isDigit(ch)) {
                value = Character.getNumericValue(ch);
            } else if (CHAR_VALUES.containsKey(ch)) {
                value = CHAR_VALUES.get(ch);
            } else {
                return false;
            }
            sum += value * Math.pow(2, i);
        }

        int checkDigit = sum % 11;
        if (checkDigit == 10) checkDigit = 0;

        return checkDigit == Character.getNumericValue(clean.charAt(10));
    }
}
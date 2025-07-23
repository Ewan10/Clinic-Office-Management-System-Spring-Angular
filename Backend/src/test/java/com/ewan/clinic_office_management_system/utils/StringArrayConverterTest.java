package com.ewan.clinic_office_management_system.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StringArrayConverterTest {

    private StringArrayConverter converter;

    @BeforeEach
    void setUp() {
        converter = new StringArrayConverter();
    }

    @Test
    void shouldConvertArrayToJson() {
        String[] input = { "Aspirin", "Paracetamol" };
        String json = converter.convertToDatabaseColumn(input);
        assertEquals("[\"Aspirin\",\"Paracetamol\"]", json);
    }

    @Test
    void shouldConvertJsonToArray() {
        String json = "[\"Ibuprofen\",\"Codeine\"]";
        String[] result = converter.convertToEntityAttribute(json);
        assertArrayEquals(new String[] { "Ibuprofen", "Codeine" }, result);
    }

    @Test
    void shouldThrowExceptionOnInvalidJsonInput() {
        String invalidJson = "[\"missingQuote, \"another\"]";
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> converter.convertToEntityAttribute(invalidJson));
        assertTrue(exception.getMessage().contains("Could not convert JSON to String[]"));
    }

}

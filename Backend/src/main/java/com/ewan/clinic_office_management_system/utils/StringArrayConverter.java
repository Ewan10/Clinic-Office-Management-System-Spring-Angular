package com.ewan.clinic_office_management_system.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(String[] attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not convert String[] to JSON", e);
        }
    }

    @Override
    public String[] convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, String[].class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not convert JSON to String[]", e);
        }
    }
}

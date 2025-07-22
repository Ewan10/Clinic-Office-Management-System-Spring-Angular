package com.ewan.clinic_office_management_system.services;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.ewan.clinic_office_management_system.security.JwtConfig;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;

@ExtendWith(MockitoExtension.class)
public class JWTServiceTest {
    @Mock
    private JwtConfig jwtConfig;
    @InjectMocks
    private JWTService jwtService;

    private final String userName = "testUser";
    private final String rawSecret = "mysuperSecretKeyMySuperSecretkey32!";
    private String base64SecretKey;
    private String token;
    private SecretKey decodedKey;

    @BeforeEach
    void setUp() {
        byte[] rawKeyBytes = rawSecret.getBytes(StandardCharsets.UTF_8);
        base64SecretKey = Encoders.BASE64.encode(rawKeyBytes);
        when(jwtConfig.getSecret()).thenReturn(base64SecretKey);

        jwtService = new JWTService(jwtConfig);
        token = jwtService.generateToken(userName);
        decodedKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64SecretKey));
    }

    @Test
    void shouldReturnSecretKeyFromJwtConfig() {
        String expectedSecretKey = "mysuperSecretKeyMySuperSecretkey32!";
        when(jwtConfig.getSecret()).thenReturn(expectedSecretKey);
        String actualSecretKey = jwtService.getSecretKey();
        assertEquals(expectedSecretKey, actualSecretKey);
        verify(jwtConfig, times(2)).getSecret();
    }

    @Test
    void shouldGenerateTokenSuccessfully() {
        Claims claims = Jwts
                .parser()
                .verifyWith(Keys.hmacShaKeyFor(decodedKey.getEncoded()))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertEquals(userName, claims.getSubject());
        verify(jwtConfig, atLeastOnce()).getSecret();
    }

    @Test
    void shouldExtractUserNameFromToken() {
        String exctractedUser = jwtService.extractUserName(token);
        assertEquals(userName, exctractedUser);
    }

    @Test
    void shouldExtractAllClaimsFromValidToken() {
        Claims claims = jwtService.extractAllClaims(token);

        assertEquals(userName, claims.getSubject());
    }

    @Test
    void shouldBeTrueForValidToken() {
        UserDetails userDetails = mock(UserDetails.class);
        boolean isValid = jwtService.validateToken(token, userDetails);
        assertTrue(isValid);
    }

}
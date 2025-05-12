package com.ewan.clinic_office_management_system.services;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

    private String SECRET_KEY = "Tq+M2FpXKsbPoLtuMbG6vEl+oFZrKd0v3o2mP6s43Q8=";

    public JWTService() {
    }

    @SuppressWarnings("deprecation")
    public String generateToken(String userName) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .claims(claims)
                .subject(userName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 8))
                .signWith(SignatureAlgorithm.HS256, getKey().getEncoded())
                .compact();
    }

    private SecretKey getKey() {
        byte[] secretKey = Decoders.BASE64.decode(this.SECRET_KEY);
        return Keys.hmacShaKeyFor(secretKey);
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return true;
    }

}

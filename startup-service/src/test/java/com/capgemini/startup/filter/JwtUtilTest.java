package com.capgemini.startup.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LXRoYXQtaXMtYXQtbGVhc3QtMjU2LWJpdHMtbG9uZw==";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
    }

    private String buildToken(Long userId, String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET));
        return Jwts.builder()
                .claims(Map.of("userId", userId, "email", email, "roles", List.of(role)))
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600_000L))
                .signWith(key)
                .compact();
    }

    @Test
    void validateToken_withValidToken_shouldReturnTrue() {
        String token = buildToken(1L, "alice@example.com", "FOUNDER");
        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withInvalidToken_shouldReturnFalse() {
        assertThat(jwtUtil.validateToken("not.a.valid.jwt")).isFalse();
    }

    @Test
    void extractUserId_shouldReturnCorrectUserId() {
        String token = buildToken(42L, "alice@example.com", "FOUNDER");
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(42L);
    }

    @Test
    void extractRoles_shouldReturnRolesList() {
        String token = buildToken(1L, "alice@example.com", "INVESTOR");
        assertThat(jwtUtil.extractRoles(token)).containsExactly("INVESTOR");
    }

    @Test
    void extractAllClaims_shouldContainUserId() {
        String token = buildToken(5L, "bob@example.com", "FOUNDER");
        assertThat(jwtUtil.extractAllClaims(token).get("userId", Long.class)).isEqualTo(5L);
    }
}

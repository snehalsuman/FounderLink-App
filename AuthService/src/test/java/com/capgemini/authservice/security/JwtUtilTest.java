package com.capgemini.authservice.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    // 256-bit Base64-encoded secret for tests
    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LXRoYXQtaXMtYXQtbGVhc3QtMjU2LWJpdHMtbG9uZw==";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "accessTokenExpiration", 3600000L);   // 1h
        ReflectionTestUtils.setField(jwtUtil, "refreshTokenExpiration", 86400000L); // 24h
    }

    @Test
    void generateAccessToken_shouldReturnNonNullToken() {
        String token = jwtUtil.generateAccessToken(1L, "alice@example.com", "FOUNDER");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateRefreshToken_shouldReturnNonNullToken() {
        String token = jwtUtil.generateRefreshToken(1L, "alice@example.com");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void validateToken_withValidToken_shouldReturnTrue() {
        String token = jwtUtil.generateAccessToken(1L, "alice@example.com", "FOUNDER");

        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withInvalidToken_shouldReturnFalse() {
        assertThat(jwtUtil.validateToken("not.a.valid.jwt")).isFalse();
    }

    @Test
    void extractEmail_shouldReturnCorrectEmail() {
        String token = jwtUtil.generateAccessToken(1L, "alice@example.com", "FOUNDER");

        assertThat(jwtUtil.extractEmail(token)).isEqualTo("alice@example.com");
    }

    @Test
    void extractUserId_shouldReturnCorrectUserId() {
        String token = jwtUtil.generateAccessToken(42L, "alice@example.com", "FOUNDER");

        assertThat(jwtUtil.extractUserId(token)).isEqualTo(42L);
    }

    @Test
    void extractRole_shouldReturnCorrectRole() {
        String token = jwtUtil.generateAccessToken(1L, "alice@example.com", "INVESTOR");

        assertThat(jwtUtil.extractRole(token)).isEqualTo("INVESTOR");
    }

    @Test
    void generateRefreshToken_extractEmail_shouldReturnCorrectEmail() {
        String token = jwtUtil.generateRefreshToken(1L, "bob@example.com");

        assertThat(jwtUtil.extractEmail(token)).isEqualTo("bob@example.com");
    }
}
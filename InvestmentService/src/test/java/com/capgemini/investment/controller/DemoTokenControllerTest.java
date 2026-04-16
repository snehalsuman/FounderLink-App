package com.capgemini.investment.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class DemoTokenControllerTest {

    @InjectMocks
    private DemoTokenController controller;

    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LXRoYXQtaXMtYXQtbGVhc3QtMjU2LWJpdHMtbG9uZw==";
    private static final long TEST_EXPIRATION = 3600000L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(controller, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(controller, "expiration", TEST_EXPIRATION);
    }

    @Test
    void getInvestorToken_shouldReturnMapWithToken() {
        ResponseEntity<Map<String, String>> response = controller.getInvestorToken();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).containsKey("token");
        assertThat(response.getBody().get("role")).isEqualTo("INVESTOR");
        assertThat(response.getBody().get("userId")).isEqualTo("1");
        assertThat(response.getBody().get("token")).isNotBlank();
    }

    @Test
    void getFounderToken_shouldReturnMapWithToken() {
        ResponseEntity<Map<String, String>> response = controller.getFounderToken();

        assertThat(response.getBody().get("role")).isEqualTo("FOUNDER");
        assertThat(response.getBody().get("userId")).isEqualTo("2");
        assertThat(response.getBody().get("token")).isNotBlank();
    }

    @Test
    void getCofounderToken_shouldReturnMapWithToken() {
        ResponseEntity<Map<String, String>> response = controller.getCofounderToken();

        assertThat(response.getBody().get("role")).isEqualTo("COFOUNDER");
        assertThat(response.getBody().get("userId")).isEqualTo("3");
    }

    @Test
    void getAdminToken_shouldReturnMapWithToken() {
        ResponseEntity<Map<String, String>> response = controller.getAdminToken();

        assertThat(response.getBody().get("role")).isEqualTo("ADMIN");
        assertThat(response.getBody().get("userId")).isEqualTo("4");
    }
}
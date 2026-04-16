package com.capgemini.team.feign;

import com.capgemini.team.exception.ServiceUnavailableException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StartupClientFallbackFactoryTest {

    private final StartupClientFallbackFactory factory = new StartupClientFallbackFactory();

    @Test
    void create_shouldReturnClientThatThrowsServiceUnavailableException() {
        StartupClient client = factory.create(new RuntimeException("startup-service down"));

        assertThat(client).isNotNull();
        assertThatThrownBy(() -> client.getStartupById(1L))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Startup service is currently unavailable");
    }
}
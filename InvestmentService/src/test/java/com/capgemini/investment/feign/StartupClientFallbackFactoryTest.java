package com.capgemini.investment.feign;

import com.capgemini.investment.exception.ServiceUnavailableException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StartupClientFallbackFactoryTest {

    private final StartupClientFallbackFactory factory = new StartupClientFallbackFactory();

    @Test
    void create_shouldReturnClientThatThrowsServiceUnavailableException() {
        RuntimeException cause = new RuntimeException("Connection refused");

        StartupClient client = factory.create(cause);

        assertThat(client).isNotNull();
        assertThatThrownBy(() -> client.getStartupById(1L))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Startup service is currently unavailable");
    }

    @Test
    void create_withNullCause_shouldReturnClientThatThrowsServiceUnavailableException() {
        StartupClient client = factory.create(new RuntimeException("timeout"));

        assertThatThrownBy(() -> client.getStartupById(99L))
                .isInstanceOf(ServiceUnavailableException.class);
    }
}

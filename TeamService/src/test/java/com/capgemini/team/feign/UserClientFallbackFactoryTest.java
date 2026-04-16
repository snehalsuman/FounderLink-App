package com.capgemini.team.feign;

import com.capgemini.team.exception.ServiceUnavailableException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserClientFallbackFactoryTest {

    private final UserClientFallbackFactory factory = new UserClientFallbackFactory();

    @Test
    void create_shouldReturnClientThatThrowsServiceUnavailableException() {
        UserClient client = factory.create(new RuntimeException("user-service down"));

        assertThat(client).isNotNull();
        assertThatThrownBy(() -> client.getUserById(1L))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("User service is currently unavailable");
    }
}
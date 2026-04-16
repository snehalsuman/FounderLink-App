package com.capgemini.authservice.config;

import com.capgemini.authservice.dto.UserRegisteredEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class RabbitMQConfigTest {

    private RabbitMQConfig config;

    @BeforeEach
    void setUp() {
        config = new RabbitMQConfig();
        ReflectionTestUtils.setField(config, "exchange", "founderlink.exchange");
    }

    @Test
    void founderLinkExchange_shouldHaveCorrectName() {
        TopicExchange exchange = config.founderLinkExchange();
        assertThat(exchange.getName()).isEqualTo("founderlink.exchange");
    }

    @Test
    void messageConverter_shouldReturnNonNull() {
        MessageConverter converter = config.messageConverter();
        assertThat(converter).isNotNull();
    }

    // ── UserRegisteredEvent DTO ───────────────────────────────────────────────

    @Test
    void userRegisteredEvent_builder_shouldSetAllFields() {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(1L)
                .name("Alice")
                .email("alice@example.com")
                .role("FOUNDER")
                .build();

        assertThat(event.getUserId()).isEqualTo(1L);
        assertThat(event.getName()).isEqualTo("Alice");
        assertThat(event.getEmail()).isEqualTo("alice@example.com");
        assertThat(event.getRole()).isEqualTo("FOUNDER");
    }

    @Test
    void userRegisteredEvent_allArgsConstructor_shouldWork() {
        UserRegisteredEvent event = new UserRegisteredEvent(2L, "Bob", "bob@example.com", "INVESTOR");
        assertThat(event.getUserId()).isEqualTo(2L);
        assertThat(event.getRole()).isEqualTo("INVESTOR");
    }

    @Test
    void userRegisteredEvent_noArgsConstructor_shouldWork() {
        UserRegisteredEvent event = new UserRegisteredEvent();
        event.setEmail("test@example.com");
        assertThat(event.getEmail()).isEqualTo("test@example.com");
    }
}
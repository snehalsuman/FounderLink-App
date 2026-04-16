package com.capgemini.startup.config;

import com.capgemini.startup.dto.StartupCreatedEvent;
import com.capgemini.startup.dto.StartupRejectedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.MessageConverter;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class RabbitMQConfigTest {

    private RabbitMQConfig config;

    @BeforeEach
    void setUp() {
        config = new RabbitMQConfig();
    }

    // ── Exchange ──────────────────────────────────────────────────────────────

    @Test
    void exchange_shouldHaveCorrectName() {
        TopicExchange exchange = config.exchange();
        assertThat(exchange.getName()).isEqualTo(RabbitMQConfig.EXCHANGE_NAME);
    }

    // ── Queues ────────────────────────────────────────────────────────────────

    @Test
    void startupCreatedQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.startupCreatedQueue();
        assertThat(queue.getName()).isEqualTo(RabbitMQConfig.STARTUP_CREATED_QUEUE);
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void startupRejectedQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.startupRejectedQueue();
        assertThat(queue.getName()).isEqualTo(RabbitMQConfig.STARTUP_REJECTED_QUEUE);
        assertThat(queue.isDurable()).isTrue();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────

    @Test
    void startupCreatedBinding_shouldBindWithCorrectRoutingKey() {
        Queue queue = config.startupCreatedQueue();
        TopicExchange exchange = config.exchange();
        Binding binding = config.startupCreatedBinding(queue, exchange);
        assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.STARTUP_CREATED_ROUTING_KEY);
        assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.STARTUP_CREATED_QUEUE);
    }

    @Test
    void startupRejectedBinding_shouldBindWithCorrectRoutingKey() {
        Queue queue = config.startupRejectedQueue();
        TopicExchange exchange = config.exchange();
        Binding binding = config.startupRejectedBinding(queue, exchange);
        assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.STARTUP_REJECTED_ROUTING_KEY);
        assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.STARTUP_REJECTED_QUEUE);
    }

    // ── Message Converter ─────────────────────────────────────────────────────

    @Test
    void jsonMessageConverter_shouldReturnNonNull() {
        MessageConverter converter = config.jsonMessageConverter();
        assertThat(converter).isNotNull();
    }

    // ── Constants ─────────────────────────────────────────────────────────────

    @Test
    void constants_shouldHaveCorrectValues() {
        assertThat(RabbitMQConfig.EXCHANGE_NAME).isEqualTo("founderlink.exchange");
        assertThat(RabbitMQConfig.STARTUP_CREATED_QUEUE).isEqualTo("startup.created.queue");
        assertThat(RabbitMQConfig.STARTUP_CREATED_ROUTING_KEY).isEqualTo("startup.created");
        assertThat(RabbitMQConfig.STARTUP_REJECTED_QUEUE).isEqualTo("startup.rejected.queue");
        assertThat(RabbitMQConfig.STARTUP_REJECTED_ROUTING_KEY).isEqualTo("startup.rejected");
    }

    // ── Event DTOs ────────────────────────────────────────────────────────────

    @Test
    void startupCreatedEvent_builder_shouldSetAllFields() {
        StartupCreatedEvent event = StartupCreatedEvent.builder()
                .startupId(1L)
                .founderId(2L)
                .startupName("TechCorp")
                .industry("FinTech")
                .fundingGoal(new BigDecimal("500000"))
                .build();

        assertThat(event.getStartupId()).isEqualTo(1L);
        assertThat(event.getFounderId()).isEqualTo(2L);
        assertThat(event.getStartupName()).isEqualTo("TechCorp");
        assertThat(event.getIndustry()).isEqualTo("FinTech");
        assertThat(event.getFundingGoal()).isEqualTo(new BigDecimal("500000"));
    }

    @Test
    void startupCreatedEvent_allArgsConstructor_shouldWork() {
        StartupCreatedEvent event = new StartupCreatedEvent(1L, 2L, "TechCorp", "HealthTech", new BigDecimal("100000"));
        assertThat(event.getStartupName()).isEqualTo("TechCorp");
    }

    @Test
    void startupRejectedEvent_builder_shouldSetAllFields() {
        StartupRejectedEvent event = StartupRejectedEvent.builder()
                .startupId(10L)
                .founderId(20L)
                .startupName("RejectedCorp")
                .build();

        assertThat(event.getStartupId()).isEqualTo(10L);
        assertThat(event.getFounderId()).isEqualTo(20L);
        assertThat(event.getStartupName()).isEqualTo("RejectedCorp");
    }

    @Test
    void startupRejectedEvent_noArgsConstructor_shouldWork() {
        StartupRejectedEvent event = new StartupRejectedEvent();
        event.setStartupName("TestStartup");
        assertThat(event.getStartupName()).isEqualTo("TestStartup");
    }
}
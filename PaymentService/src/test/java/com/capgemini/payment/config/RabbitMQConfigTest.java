package com.capgemini.payment.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

import static org.assertj.core.api.Assertions.assertThat;

class RabbitMQConfigTest {

    private RabbitMQConfig config;

    @BeforeEach
    void setUp() {
        config = new RabbitMQConfig();
    }

    // ── Exchange ──────────────────────────────────────────────────────────────

    @Test
    void paymentExchange_shouldHaveCorrectName() {
        TopicExchange exchange = config.paymentExchange();
        assertThat(exchange.getName()).isEqualTo(RabbitMQConfig.PAYMENT_EXCHANGE);
    }

    // ── Queues ────────────────────────────────────────────────────────────────

    @Test
    void paymentSuccessQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.paymentSuccessQueue();
        assertThat(queue.getName()).isEqualTo(RabbitMQConfig.PAYMENT_SUCCESS_QUEUE);
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void paymentFailedQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.paymentFailedQueue();
        assertThat(queue.getName()).isEqualTo(RabbitMQConfig.PAYMENT_FAILED_QUEUE);
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void paymentPendingQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.paymentPendingQueue();
        assertThat(queue.getName()).isEqualTo(RabbitMQConfig.PAYMENT_PENDING_QUEUE);
        assertThat(queue.isDurable()).isTrue();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────

    @Test
    void paymentSuccessBinding_shouldBindWithCorrectRoutingKey() {
        Binding binding = config.paymentSuccessBinding();
        assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.PAYMENT_SUCCESS_KEY);
        assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.PAYMENT_SUCCESS_QUEUE);
    }

    @Test
    void paymentFailedBinding_shouldBindWithCorrectRoutingKey() {
        Binding binding = config.paymentFailedBinding();
        assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.PAYMENT_FAILED_KEY);
        assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.PAYMENT_FAILED_QUEUE);
    }

    @Test
    void paymentPendingBinding_shouldBindWithCorrectRoutingKey() {
        Binding binding = config.paymentPendingBinding();
        assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.PAYMENT_PENDING_KEY);
        assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.PAYMENT_PENDING_QUEUE);
    }

    // ── Message Converter ─────────────────────────────────────────────────────

    @Test
    void messageConverter_shouldReturnJackson2JsonConverter() {
        Jackson2JsonMessageConverter converter = config.messageConverter();
        assertThat(converter).isNotNull();
    }

    // ── Constants ─────────────────────────────────────────────────────────────

    @Test
    void constants_shouldHaveCorrectValues() {
        assertThat(RabbitMQConfig.PAYMENT_EXCHANGE).isEqualTo("founderlink.exchange");
        assertThat(RabbitMQConfig.PAYMENT_SUCCESS_QUEUE).isEqualTo("payment.success.queue");
        assertThat(RabbitMQConfig.PAYMENT_FAILED_QUEUE).isEqualTo("payment.failed.queue");
        assertThat(RabbitMQConfig.PAYMENT_PENDING_QUEUE).isEqualTo("payment.pending.queue");
        assertThat(RabbitMQConfig.PAYMENT_SUCCESS_KEY).isEqualTo("payment.success");
        assertThat(RabbitMQConfig.PAYMENT_FAILED_KEY).isEqualTo("payment.failed");
        assertThat(RabbitMQConfig.PAYMENT_PENDING_KEY).isEqualTo("payment.pending");
    }
}
package com.capgemini.investment.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
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
        ReflectionTestUtils.setField(config, "investmentCreatedQueue", "notification.investment.created");
        ReflectionTestUtils.setField(config, "investmentApprovedQueue", "notification.investment.approved");
        ReflectionTestUtils.setField(config, "investmentCreatedRoutingKey", "investment.created");
        ReflectionTestUtils.setField(config, "investmentApprovedRoutingKey", "investment.approved");
    }

    @Test
    void exchange_shouldHaveCorrectName() {
        TopicExchange exchange = config.exchange();
        assertThat(exchange.getName()).isEqualTo("founderlink.exchange");
    }

    @Test
    void investmentCreatedQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.investmentCreatedQueue();
        assertThat(queue.getName()).isEqualTo("notification.investment.created");
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void investmentApprovedQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.investmentApprovedQueue();
        assertThat(queue.getName()).isEqualTo("notification.investment.approved");
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void investmentCreatedBinding_shouldBindWithCorrectRoutingKey() {
        Queue queue = config.investmentCreatedQueue();
        TopicExchange exchange = config.exchange();
        Binding binding = config.investmentCreatedBinding(queue, exchange);
        assertThat(binding.getRoutingKey()).isEqualTo("investment.created");
        assertThat(binding.getDestination()).isEqualTo("notification.investment.created");
    }

    @Test
    void investmentApprovedBinding_shouldBindWithCorrectRoutingKey() {
        Queue queue = config.investmentApprovedQueue();
        TopicExchange exchange = config.exchange();
        Binding binding = config.investmentApprovedBinding(queue, exchange);
        assertThat(binding.getRoutingKey()).isEqualTo("investment.approved");
        assertThat(binding.getDestination()).isEqualTo("notification.investment.approved");
    }

    @Test
    void messageConverter_shouldReturnNonNull() {
        MessageConverter converter = config.messageConverter();
        assertThat(converter).isNotNull();
    }
}
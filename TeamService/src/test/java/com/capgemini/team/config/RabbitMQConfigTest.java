package com.capgemini.team.config;

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
        ReflectionTestUtils.setField(config, "teamInviteSentQueue", "notification.team.invite.sent");
        ReflectionTestUtils.setField(config, "teamInviteSentRoutingKey", "team.invite.sent");
    }

    @Test
    void exchange_shouldHaveCorrectName() {
        TopicExchange exchange = config.exchange();
        assertThat(exchange.getName()).isEqualTo("founderlink.exchange");
    }

    @Test
    void teamInviteSentQueue_shouldBeDurableWithCorrectName() {
        Queue queue = config.teamInviteSentQueue();
        assertThat(queue.getName()).isEqualTo("notification.team.invite.sent");
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void teamInviteSentBinding_shouldBindWithCorrectRoutingKey() {
        Queue queue = config.teamInviteSentQueue();
        TopicExchange exchange = config.exchange();
        Binding binding = config.teamInviteSentBinding(queue, exchange);
        assertThat(binding.getRoutingKey()).isEqualTo("team.invite.sent");
        assertThat(binding.getDestination()).isEqualTo("notification.team.invite.sent");
    }

    @Test
    void messageConverter_shouldReturnNonNull() {
        MessageConverter converter = config.messageConverter();
        assertThat(converter).isNotNull();
    }
}
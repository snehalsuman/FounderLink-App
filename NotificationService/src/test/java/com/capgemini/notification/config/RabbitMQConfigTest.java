package com.capgemini.notification.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
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
        ReflectionTestUtils.setField(config, "teamInviteSentQueue", "notification.team.invite.sent");
        ReflectionTestUtils.setField(config, "startupCreatedQueue", "notification.startup.created");
        ReflectionTestUtils.setField(config, "startupRejectedQueue", "notification.startup.rejected");
        ReflectionTestUtils.setField(config, "paymentSuccessQueue", "notification.payment.success");
        ReflectionTestUtils.setField(config, "paymentFailedQueue", "notification.payment.failed");
        ReflectionTestUtils.setField(config, "userRegisteredQueue", "notification.user.registered");
    }

    @Test
    void founderLinkExchange_shouldReturnTopicExchange() {
        TopicExchange exchange = config.founderLinkExchange();
        assertThat(exchange).isNotNull();
        assertThat(exchange.getName()).isEqualTo("founderlink.exchange");
    }

    @Test
    void investmentCreatedQueue_shouldReturnDurableQueue() {
        Queue queue = config.investmentCreatedQueue();
        assertThat(queue.isDurable()).isTrue();
        assertThat(queue.getName()).isEqualTo("notification.investment.created");
    }

    @Test
    void investmentApprovedQueue_shouldReturnDurableQueue() {
        Queue queue = config.investmentApprovedQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void teamInviteSentQueue_shouldReturnDurableQueue() {
        Queue queue = config.teamInviteSentQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void startupCreatedQueue_shouldReturnDurableQueue() {
        Queue queue = config.startupCreatedQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void startupRejectedQueue_shouldReturnDurableQueue() {
        Queue queue = config.startupRejectedQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void paymentSuccessQueue_shouldReturnDurableQueue() {
        Queue queue = config.paymentSuccessQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void paymentFailedQueue_shouldReturnDurableQueue() {
        Queue queue = config.paymentFailedQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void userRegisteredQueue_shouldReturnDurableQueue() {
        Queue queue = config.userRegisteredQueue();
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void investmentCreatedBinding_shouldBindCorrectly() {
        Binding binding = config.investmentCreatedBinding();
        assertThat(binding).isNotNull();
        assertThat(binding.getRoutingKey()).isEqualTo("investment.created");
    }

    @Test
    void investmentApprovedBinding_shouldBindCorrectly() {
        Binding binding = config.investmentApprovedBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("investment.approved");
    }

    @Test
    void teamInviteSentBinding_shouldBindCorrectly() {
        Binding binding = config.teamInviteSentBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("team.invite.sent");
    }

    @Test
    void startupCreatedBinding_shouldBindCorrectly() {
        Binding binding = config.startupCreatedBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("startup.created");
    }

    @Test
    void startupRejectedBinding_shouldBindCorrectly() {
        Binding binding = config.startupRejectedBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("startup.rejected");
    }

    @Test
    void paymentSuccessBinding_shouldBindCorrectly() {
        Binding binding = config.paymentSuccessBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("payment.success");
    }

    @Test
    void paymentFailedBinding_shouldBindCorrectly() {
        Binding binding = config.paymentFailedBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("payment.failed");
    }

    @Test
    void userRegisteredBinding_shouldBindCorrectly() {
        Binding binding = config.userRegisteredBinding();
        assertThat(binding.getRoutingKey()).isEqualTo("user.registered");
    }

    @Test
    void messageConverter_shouldReturnJackson2JsonConverter() {
        MessageConverter converter = config.messageConverter();
        assertThat(converter).isInstanceOf(Jackson2JsonMessageConverter.class);
    }
}

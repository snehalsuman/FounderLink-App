package com.capgemini.investment.event;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private EventPublisher eventPublisher;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(eventPublisher, "exchange", "founderlink.exchange");
        ReflectionTestUtils.setField(eventPublisher, "investmentCreatedRoutingKey", "investment.created");
        ReflectionTestUtils.setField(eventPublisher, "investmentApprovedRoutingKey", "investment.approved");
    }

    @Test
    void publishInvestmentCreated_shouldSendToCorrectExchangeAndRoutingKey() {
        InvestmentCreatedEvent event = new InvestmentCreatedEvent(1L, 10L, 5L, 20L, new BigDecimal("50000"));

        eventPublisher.publishInvestmentCreated(event);

        verify(rabbitTemplate).convertAndSend(
                eq("founderlink.exchange"),
                eq("investment.created"),
                eq(event)
        );
    }

    @Test
    void publishInvestmentApproved_shouldSendToCorrectExchangeAndRoutingKey() {
        InvestmentApprovedEvent event = new InvestmentApprovedEvent(1L, 10L, 5L, new BigDecimal("50000"));

        eventPublisher.publishInvestmentApproved(event);

        verify(rabbitTemplate).convertAndSend(
                eq("founderlink.exchange"),
                eq("investment.approved"),
                eq(event)
        );
    }
}

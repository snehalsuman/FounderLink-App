package com.capgemini.notification.listener;

import com.capgemini.notification.enums.NotificationType;
import com.capgemini.notification.event.InvestmentApprovedEvent;
import com.capgemini.notification.event.InvestmentCreatedEvent;
import com.capgemini.notification.event.StartupCreatedEvent;
import com.capgemini.notification.event.StartupRejectedEvent;
import com.capgemini.notification.event.TeamInviteSentEvent;
import com.capgemini.notification.service.EmailService;
import com.capgemini.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationEventListener listener;

    // ── handleUserRegistered ───────────────────────────────────────────────────

    @Test
    void handleUserRegistered_withFounderRole_shouldCreateNotification() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", 10);
        payload.put("name", "Alice");
        payload.put("email", "alice@test.com");
        payload.put("role", "ROLE_FOUNDER");

        listener.handleUserRegistered(payload);

        verify(notificationService).createNotification(
                eq(10L),
                contains("Alice"),
                eq(NotificationType.USER_REGISTERED)
        );
    }

    @Test
    void handleUserRegistered_withInvestorRole_shouldCreateNotification() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", 20);
        payload.put("name", "Bob");
        payload.put("email", "bob@test.com");
        payload.put("role", "ROLE_INVESTOR");

        listener.handleUserRegistered(payload);

        verify(notificationService).createNotification(
                eq(20L),
                contains("Bob"),
                eq(NotificationType.USER_REGISTERED)
        );
    }

    @Test
    void handleUserRegistered_withCofounderRole_shouldCreateNotification() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", 30);
        payload.put("name", "Carol");
        payload.put("email", "carol@test.com");
        payload.put("role", "ROLE_COFOUNDER");

        listener.handleUserRegistered(payload);

        verify(notificationService).createNotification(
                eq(30L),
                contains("Carol"),
                eq(NotificationType.USER_REGISTERED)
        );
    }

    @Test
    void handleUserRegistered_withUnknownRole_shouldCreateNotification() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", 40);
        payload.put("name", "Dave");
        payload.put("email", "dave@test.com");
        payload.put("role", "ROLE_UNKNOWN");

        listener.handleUserRegistered(payload);

        verify(notificationService).createNotification(
                eq(40L),
                contains("Dave"),
                eq(NotificationType.USER_REGISTERED)
        );
    }

    @Test
    void handleUserRegistered_whenUserIdNull_shouldNotCreateNotification() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", null);
        payload.put("name", "Alice");
        payload.put("email", "alice@test.com");
        payload.put("role", "ROLE_FOUNDER");

        listener.handleUserRegistered(payload);

        verify(notificationService, never()).createNotification(any(), any(), any());
    }

    @Test
    void handleUserRegistered_whenExceptionThrown_shouldNotPropagate() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", 10);
        payload.put("name", "Alice");
        payload.put("email", "alice@test.com");
        payload.put("role", "ROLE_FOUNDER");

        doThrow(new RuntimeException("DB error"))
                .when(notificationService).createNotification(any(), any(), any());

        // Should not throw
        listener.handleUserRegistered(payload);
    }

    // ── handleStartupCreated ──────────────────────────────────────────────────

    @Test
    void handleStartupCreated_shouldCreateNotificationForFounder() {
        StartupCreatedEvent event = new StartupCreatedEvent(1L, 10L, "CleanTech", new BigDecimal("500000"));

        listener.handleStartupCreated(event);

        verify(notificationService).createNotification(
                eq(10L),
                contains("submitted for review"),
                eq(NotificationType.STARTUP_CREATED)
        );
    }

    // ── handleInvestmentCreated ───────────────────────────────────────────────

    @Test
    void handleInvestmentCreated_shouldCreateNotificationForFounder() {
        InvestmentCreatedEvent event = new InvestmentCreatedEvent(100L, 1L, 2L, 10L, new BigDecimal("50000"));

        listener.handleInvestmentCreated(event);

        verify(notificationService).createNotification(
                eq(10L),
                contains("50000"),
                eq(NotificationType.INVESTMENT_CREATED)
        );
    }

    // ── handleInvestmentApproved ──────────────────────────────────────────────

    @Test
    void handleInvestmentApproved_shouldCreateNotificationForInvestor() {
        InvestmentApprovedEvent event = new InvestmentApprovedEvent(100L, 1L, 2L, new BigDecimal("50000"));

        listener.handleInvestmentApproved(event);

        verify(notificationService).createNotification(
                eq(2L),
                contains("approved"),
                eq(NotificationType.INVESTMENT_APPROVED)
        );
    }

    // ── handleStartupRejected ─────────────────────────────────────────────────

    @Test
    void handleStartupRejected_shouldCreateNotificationForFounder() {
        StartupRejectedEvent event = new StartupRejectedEvent(1L, 10L, "GreenTech");

        listener.handleStartupRejected(event);

        verify(notificationService).createNotification(
                eq(10L),
                contains("GreenTech"),
                eq(NotificationType.STARTUP_REJECTED)
        );
    }

    // ── handleTeamInvite ──────────────────────────────────────────────────────

    @Test
    void handleTeamInvite_shouldCreateNotificationForInvitedUser() {
        TeamInviteSentEvent event = new TeamInviteSentEvent(1L, 5L, "CO_FOUNDER");

        listener.handleTeamInvite(event);

        verify(notificationService).createNotification(
                eq(5L),
                contains("CO_FOUNDER"),
                eq(NotificationType.TEAM_INVITE_SENT)
        );
    }

    // ── handlePaymentFailed ───────────────────────────────────────────────────

    @Test
    void handlePaymentFailed_shouldCreateNotificationForBothParties() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", 2);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        listener.handlePaymentFailed(payload);

        verify(notificationService).createNotification(
                eq(2L),
                contains("GreenTech"),
                eq(NotificationType.PAYMENT_REJECTED)
        );
        verify(notificationService).createNotification(
                eq(10L),
                contains("Bob"),
                eq(NotificationType.PAYMENT_REJECTED)
        );
    }

    @Test
    void handlePaymentFailed_whenInvestorIdNull_shouldNotifyOnlyFounder() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", null);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        listener.handlePaymentFailed(payload);

        verify(notificationService, times(1)).createNotification(any(), any(), any());
        verify(notificationService).createNotification(eq(10L), any(), eq(NotificationType.PAYMENT_REJECTED));
    }

    @Test
    void handlePaymentFailed_whenFounderIdNull_shouldNotifyOnlyInvestor() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", 2);
        payload.put("founderId", null);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        listener.handlePaymentFailed(payload);

        verify(notificationService, times(1)).createNotification(any(), any(), any());
        verify(notificationService).createNotification(eq(2L), any(), eq(NotificationType.PAYMENT_REJECTED));
    }

    @Test
    void handlePaymentFailed_whenExceptionThrown_shouldNotPropagate() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", 2);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        doThrow(new RuntimeException("DB error"))
                .when(notificationService).createNotification(any(), any(), any());

        // Should not throw
        listener.handlePaymentFailed(payload);
    }

    // ── handlePaymentSuccess ──────────────────────────────────────────────────

    @Test
    void handlePaymentSuccess_shouldCreateNotificationForBothParties() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", 2);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        listener.handlePaymentSuccess(payload);

        verify(notificationService).createNotification(
                eq(2L),
                contains("GreenTech"),
                eq(NotificationType.PAYMENT_SUCCESS)
        );
        verify(notificationService).createNotification(
                eq(10L),
                contains("Bob"),
                eq(NotificationType.PAYMENT_SUCCESS)
        );
    }

    @Test
    void handlePaymentSuccess_whenInvestorIdNull_shouldNotifyOnlyFounder() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", null);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        listener.handlePaymentSuccess(payload);

        verify(notificationService, times(1)).createNotification(any(), any(), any());
        verify(notificationService).createNotification(eq(10L), any(), eq(NotificationType.PAYMENT_SUCCESS));
    }

    @Test
    void handlePaymentSuccess_whenExceptionThrown_shouldNotPropagate() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("investorId", 2);
        payload.put("founderId", 10);
        payload.put("startupName", "GreenTech");
        payload.put("investorName", "Bob");
        payload.put("amount", 50000);

        doThrow(new RuntimeException("DB error"))
                .when(notificationService).createNotification(any(), any(), any());

        // Should not throw
        listener.handlePaymentSuccess(payload);
    }
}
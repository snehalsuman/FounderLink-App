package com.capgemini.notification.event;

import com.capgemini.notification.dto.ApiResponse;
import com.capgemini.notification.dto.NotificationResponse;
import com.capgemini.notification.entity.Notification;
import com.capgemini.notification.enums.NotificationType;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EventAndDtoTest {

    // ── InvestmentCreatedEvent ────────────────────────────────────────────────

    @Test
    void investmentCreatedEvent_allArgsConstructor_shouldSetAllFields() {
        InvestmentCreatedEvent event = new InvestmentCreatedEvent(1L, 2L, 3L, 4L, new BigDecimal("10000"));
        assertThat(event.getInvestmentId()).isEqualTo(1L);
        assertThat(event.getStartupId()).isEqualTo(2L);
        assertThat(event.getInvestorId()).isEqualTo(3L);
        assertThat(event.getFounderId()).isEqualTo(4L);
        assertThat(event.getAmount()).isEqualTo(new BigDecimal("10000"));
    }

    @Test
    void investmentCreatedEvent_noArgsConstructor_shouldWork() {
        InvestmentCreatedEvent event = new InvestmentCreatedEvent();
        event.setInvestmentId(5L);
        assertThat(event.getInvestmentId()).isEqualTo(5L);
    }

    // ── InvestmentApprovedEvent ───────────────────────────────────────────────

    @Test
    void investmentApprovedEvent_allArgsConstructor_shouldSetAllFields() {
        InvestmentApprovedEvent event = new InvestmentApprovedEvent(1L, 2L, 3L, new BigDecimal("5000"));
        assertThat(event.getInvestmentId()).isEqualTo(1L);
        assertThat(event.getStartupId()).isEqualTo(2L);
        assertThat(event.getInvestorId()).isEqualTo(3L);
        assertThat(event.getAmount()).isEqualTo(new BigDecimal("5000"));
    }

    // ── StartupCreatedEvent ───────────────────────────────────────────────────

    @Test
    void startupCreatedEvent_allArgsConstructor_shouldSetAllFields() {
        StartupCreatedEvent event = new StartupCreatedEvent(10L, 20L, "FinTech", new BigDecimal("500000"));
        assertThat(event.getStartupId()).isEqualTo(10L);
        assertThat(event.getFounderId()).isEqualTo(20L);
        assertThat(event.getIndustry()).isEqualTo("FinTech");
        assertThat(event.getFundingGoal()).isEqualTo(new BigDecimal("500000"));
    }

    // ── StartupRejectedEvent ──────────────────────────────────────────────────

    @Test
    void startupRejectedEvent_allArgsConstructor_shouldSetAllFields() {
        StartupRejectedEvent event = new StartupRejectedEvent(10L, 20L, "StartupX");
        assertThat(event.getStartupId()).isEqualTo(10L);
        assertThat(event.getFounderId()).isEqualTo(20L);
        assertThat(event.getStartupName()).isEqualTo("StartupX");
    }

    @Test
    void startupRejectedEvent_noArgsConstructor_shouldWork() {
        StartupRejectedEvent event = new StartupRejectedEvent();
        event.setStartupName("MyStartup");
        assertThat(event.getStartupName()).isEqualTo("MyStartup");
    }

    // ── TeamInviteSentEvent ───────────────────────────────────────────────────

    @Test
    void teamInviteSentEvent_allArgsConstructor_shouldSetAllFields() {
        TeamInviteSentEvent event = new TeamInviteSentEvent(5L, 10L, "CO_FOUNDER");
        assertThat(event.getStartupId()).isEqualTo(5L);
        assertThat(event.getInvitedUserId()).isEqualTo(10L);
        assertThat(event.getRole()).isEqualTo("CO_FOUNDER");
    }

    // ── PaymentSuccessEvent ───────────────────────────────────────────────────

    @Test
    void paymentSuccessEvent_allArgsConstructor_shouldSetAllFields() {
        PaymentSuccessEvent event = new PaymentSuccessEvent(
                1L, 2L, 3L, 4L, "TechCorp", "InvestorX", 50000.0, "pay_abc", "SUCCESS"
        );
        assertThat(event.getPaymentId()).isEqualTo(1L);
        assertThat(event.getInvestorId()).isEqualTo(2L);
        assertThat(event.getFounderId()).isEqualTo(3L);
        assertThat(event.getStartupId()).isEqualTo(4L);
        assertThat(event.getStartupName()).isEqualTo("TechCorp");
        assertThat(event.getInvestorName()).isEqualTo("InvestorX");
        assertThat(event.getAmount()).isEqualTo(50000.0);
        assertThat(event.getRazorpayPaymentId()).isEqualTo("pay_abc");
        assertThat(event.getStatus()).isEqualTo("SUCCESS");
    }

    @Test
    void paymentSuccessEvent_noArgsConstructor_shouldWork() {
        PaymentSuccessEvent event = new PaymentSuccessEvent();
        event.setStatus("FAILED");
        assertThat(event.getStatus()).isEqualTo("FAILED");
    }

    // ── NotificationResponse DTO ──────────────────────────────────────────────

    @Test
    void notificationResponse_builder_shouldSetAllFields() {
        LocalDateTime now = LocalDateTime.now();
        NotificationResponse response = NotificationResponse.builder()
                .id(1L)
                .userId(5L)
                .message("You have a new investment")
                .type(NotificationType.INVESTMENT_CREATED)
                .isRead(false)
                .createdAt(now)
                .build();

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(5L);
        assertThat(response.getMessage()).isEqualTo("You have a new investment");
        assertThat(response.getType()).isEqualTo(NotificationType.INVESTMENT_CREATED);
        assertThat(response.getIsRead()).isFalse();
        assertThat(response.getCreatedAt()).isEqualTo(now);
    }

    // ── ApiResponse DTO ───────────────────────────────────────────────────────

    @Test
    void apiResponse_builder_shouldSetAllFields() {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(200)
                .message("OK")
                .data("payload")
                .build();

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getMessage()).isEqualTo("OK");
        assertThat(response.getData()).isEqualTo("payload");
    }

    // ── Notification entity @PrePersist ───────────────────────────────────────

    @Test
    void notification_prePersist_shouldSetCreatedAt() throws Exception {
        Notification notification = new Notification();
        Method onCreate = Notification.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(notification);

        assertThat(notification.getCreatedAt()).isNotNull();
    }

    @Test
    void notification_builder_shouldSetAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Notification notification = Notification.builder()
                .id(1L)
                .userId(10L)
                .message("Test notification")
                .type(NotificationType.TEAM_INVITE_SENT)
                .isRead(false)
                .createdAt(now)
                .build();

        assertThat(notification.getId()).isEqualTo(1L);
        assertThat(notification.getUserId()).isEqualTo(10L);
        assertThat(notification.getMessage()).isEqualTo("Test notification");
        assertThat(notification.getType()).isEqualTo(NotificationType.TEAM_INVITE_SENT);
        assertThat(notification.getIsRead()).isFalse();
        assertThat(notification.getCreatedAt()).isEqualTo(now);
    }
}
package com.capgemini.notification.mapper;

import com.capgemini.notification.dto.NotificationResponse;
import com.capgemini.notification.entity.Notification;
import com.capgemini.notification.enums.NotificationType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationMapperTest {

    private final NotificationMapper mapper = new NotificationMapper();

    @Test
    void toResponse_shouldMapAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Notification notification = Notification.builder()
                .id(1L)
                .userId(10L)
                .message("Test message")
                .type(NotificationType.STARTUP_CREATED)
                .isRead(false)
                .createdAt(now)
                .build();

        NotificationResponse response = mapper.toResponse(notification);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(10L);
        assertThat(response.getMessage()).isEqualTo("Test message");
        assertThat(response.getType()).isEqualTo(NotificationType.STARTUP_CREATED);
        assertThat(response.getIsRead()).isFalse();
        assertThat(response.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void toResponse_whenReadTrue_shouldMapIsReadTrue() {
        Notification notification = Notification.builder()
                .id(2L)
                .userId(20L)
                .message("Read notification")
                .type(NotificationType.INVESTMENT_APPROVED)
                .isRead(true)
                .createdAt(LocalDateTime.now())
                .build();

        NotificationResponse response = mapper.toResponse(notification);

        assertThat(response.getIsRead()).isTrue();
        assertThat(response.getType()).isEqualTo(NotificationType.INVESTMENT_APPROVED);
    }
}

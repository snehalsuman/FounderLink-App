package com.capgemini.notification.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationEmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@founderlink.com");
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void sendWelcomeEmail_withFounderRole_shouldSendEmail() {
        emailService.sendWelcomeEmail("alice@test.com", "Alice", "ROLE_FOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcomeEmail_withInvestorRole_shouldSendEmail() {
        emailService.sendWelcomeEmail("bob@test.com", "Bob", "ROLE_INVESTOR");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcomeEmail_withCofounderRole_shouldSendEmail() {
        emailService.sendWelcomeEmail("carol@test.com", "Carol", "ROLE_COFOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcomeEmail_withUnknownRole_shouldSendEmail() {
        emailService.sendWelcomeEmail("dave@test.com", "Dave", "ROLE_UNKNOWN");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcomeEmail_whenMailSenderThrows_shouldNotPropagate() {
        doThrow(new RuntimeException("SMTP failure")).when(mailSender).send(any(MimeMessage.class));

        // Should NOT throw — exception is caught internally
        emailService.sendWelcomeEmail("alice@test.com", "Alice", "ROLE_FOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }
}

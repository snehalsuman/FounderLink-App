package com.capgemini.authservice.service;

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
class WelcomeEmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private WelcomeEmailService welcomeEmailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(welcomeEmailService, "fromEmail", "noreply@founderlink.com");
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void sendWelcome_withFounderRole_shouldSendEmail() {
        welcomeEmailService.sendWelcome("alice@test.com", "Alice", "ROLE_FOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcome_withInvestorRole_shouldSendEmail() {
        welcomeEmailService.sendWelcome("bob@test.com", "Bob", "ROLE_INVESTOR");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcome_withCofounderRole_shouldSendEmail() {
        welcomeEmailService.sendWelcome("carol@test.com", "Carol", "ROLE_COFOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcome_withDefaultRole_shouldSendEmail() {
        welcomeEmailService.sendWelcome("dave@test.com", "Dave", "ROLE_UNKNOWN");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendWelcome_whenMailSenderThrows_shouldNotPropagate() {
        doThrow(new RuntimeException("SMTP failure")).when(mailSender).send(any(MimeMessage.class));

        // Should NOT throw — exception is caught internally
        welcomeEmailService.sendWelcome("alice@test.com", "Alice", "ROLE_FOUNDER");

        verify(mailSender).send(any(MimeMessage.class));
    }
}

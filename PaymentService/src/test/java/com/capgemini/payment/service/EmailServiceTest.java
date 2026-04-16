package com.capgemini.payment.service;

import com.capgemini.payment.entity.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "test@founderlink.com");
        // JavaMailSender.createMimeMessage() must return a real MimeMessage for the service to build
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    // ─── sendPaymentSuccessEmailToInvestor ───────────────────────────────────

    @Test
    void sendPaymentSuccessEmailToInvestor_success_sendsEmail() {
        Payment payment = buildPayment();

        emailService.sendPaymentSuccessEmailToInvestor(payment);

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendPaymentSuccessEmailToInvestor_mailSenderThrows_doesNotPropagate() {
        Payment payment = buildPayment();
        doThrow(new RuntimeException("SMTP failure")).when(mailSender).send(any(MimeMessage.class));

        // Should NOT throw — exception is caught internally
        emailService.sendPaymentSuccessEmailToInvestor(payment);

        verify(mailSender).send(any(MimeMessage.class));
    }

    // ─── sendPaymentReceivedEmailToFounder ───────────────────────────────────

    @Test
    void sendPaymentReceivedEmailToFounder_success_sendsEmail() {
        Payment payment = buildPayment();

        emailService.sendPaymentReceivedEmailToFounder(payment);

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendPaymentReceivedEmailToFounder_mailSenderThrows_doesNotPropagate() {
        Payment payment = buildPayment();
        doThrow(new RuntimeException("SMTP failure")).when(mailSender).send(any(MimeMessage.class));

        // Should NOT throw — exception is caught internally
        emailService.sendPaymentReceivedEmailToFounder(payment);

        verify(mailSender).send(any(MimeMessage.class));
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private Payment buildPayment() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setInvestorId(10L);
        payment.setFounderId(20L);
        payment.setStartupId(30L);
        payment.setStartupName("StartupX");
        payment.setInvestorName("InvestorY");
        payment.setInvestorEmail("investor@test.com");
        payment.setFounderEmail("founder@test.com");
        payment.setAmount(5000.0);
        payment.setRazorpayPaymentId("pay_xyz");
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        return payment;
    }
}

package com.capgemini.notification.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoggingAspectTest {

    @InjectMocks
    private LoggingAspect loggingAspect;

    @Mock
    private ProceedingJoinPoint pjp;

    @Mock
    private Signature signature;

    @Test
    void logServiceMethods_whenSucceeds_shouldReturnResult() throws Throwable {
        when(pjp.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("NotificationServiceImpl.getNotifications()");
        when(pjp.proceed()).thenReturn("result");

        Object result = loggingAspect.logServiceMethods(pjp);

        assertThat(result).isEqualTo("result");
        verify(pjp).proceed();
    }

    @Test
    void logServiceMethods_whenReturnsNull_shouldReturnNull() throws Throwable {
        when(pjp.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("NotificationServiceImpl.markRead()");
        when(pjp.proceed()).thenReturn(null);

        Object result = loggingAspect.logServiceMethods(pjp);

        assertThat(result).isNull();
        verify(pjp).proceed();
    }

    @Test
    void logServiceMethods_whenThrowsException_shouldRethrow() throws Throwable {
        when(pjp.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("NotificationServiceImpl.process()");
        when(pjp.proceed()).thenThrow(new RuntimeException("service error"));

        assertThrows(RuntimeException.class,
                () -> loggingAspect.logServiceMethods(pjp));
        verify(pjp).proceed();
    }

    @Test
    void logServiceMethods_whenThrowsCheckedException_shouldRethrow() throws Throwable {
        when(pjp.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("NotificationServiceImpl.sendEmail()");
        when(pjp.proceed()).thenThrow(new Exception("checked error"));

        assertThrows(Exception.class,
                () -> loggingAspect.logServiceMethods(pjp));
    }
}
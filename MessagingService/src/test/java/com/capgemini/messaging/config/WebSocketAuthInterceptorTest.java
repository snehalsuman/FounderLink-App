package com.capgemini.messaging.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import java.util.HashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketAuthInterceptorTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private MessageChannel channel;

    @InjectMocks
    private WebSocketAuthInterceptor interceptor;

    private Message<?> buildStompMessage(StompCommand command, String authHeader) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
        if (authHeader != null) {
            accessor.setNativeHeader("Authorization", authHeader);
        }
        accessor.setSessionId("test-session");
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    @Test
    void preSend_withNonConnectCommand_shouldPassThrough() {
        Message<?> message = buildStompMessage(StompCommand.SEND, null);
        Message<?> result = interceptor.preSend(message, channel);
        assertThat(result).isNotNull();
    }

    @Test
    void preSend_withConnectAndValidToken_shouldSetPrincipalAndAllow() {
        when(jwtUtil.validateToken("valid.token")).thenReturn(true);
        when(jwtUtil.extractUserId("valid.token")).thenReturn(5L);

        Message<?> message = buildStompMessage(StompCommand.CONNECT, "Bearer valid.token");
        Message<?> result = interceptor.preSend(message, channel);

        assertThat(result).isNotNull();
    }

    @Test
    void preSend_withConnectAndInvalidToken_shouldReturnNull() {
        when(jwtUtil.validateToken("bad.token")).thenReturn(false);

        Message<?> message = buildStompMessage(StompCommand.CONNECT, "Bearer bad.token");
        Message<?> result = interceptor.preSend(message, channel);

        assertThat(result).isNull();
    }

    @Test
    void preSend_withConnectAndNoAuthHeader_shouldPassThrough() {
        Message<?> message = buildStompMessage(StompCommand.CONNECT, null);
        Message<?> result = interceptor.preSend(message, channel);
        assertThat(result).isNotNull();
    }

    @Test
    void preSend_withConnectAndNonBearerHeader_shouldPassThrough() {
        Message<?> message = buildStompMessage(StompCommand.CONNECT, "Basic sometoken");
        Message<?> result = interceptor.preSend(message, channel);
        assertThat(result).isNotNull();
    }
}

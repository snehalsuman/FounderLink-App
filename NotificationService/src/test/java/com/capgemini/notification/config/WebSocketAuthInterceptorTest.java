package com.capgemini.notification.config;

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
        accessor.setSessionId("session-1");
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    @Test
    void preSend_withNonConnectCommand_shouldPassThrough() {
        Message<?> msg = buildStompMessage(StompCommand.SUBSCRIBE, null);
        assertThat(interceptor.preSend(msg, channel)).isNotNull();
    }

    @Test
    void preSend_withConnectAndValidToken_shouldSetPrincipalAndAllow() {
        when(jwtUtil.validateToken("good.token")).thenReturn(true);
        when(jwtUtil.extractUserId("good.token")).thenReturn(7L);

        Message<?> msg = buildStompMessage(StompCommand.CONNECT, "Bearer good.token");
        assertThat(interceptor.preSend(msg, channel)).isNotNull();
    }

    @Test
    void preSend_withConnectAndInvalidToken_shouldReturnNull() {
        when(jwtUtil.validateToken("bad.token")).thenReturn(false);

        Message<?> msg = buildStompMessage(StompCommand.CONNECT, "Bearer bad.token");
        assertThat(interceptor.preSend(msg, channel)).isNull();
    }

    @Test
    void preSend_withConnectAndNoAuthHeader_shouldPassThrough() {
        Message<?> msg = buildStompMessage(StompCommand.CONNECT, null);
        assertThat(interceptor.preSend(msg, channel)).isNotNull();
    }

    @Test
    void preSend_withConnectAndNonBearerHeader_shouldPassThrough() {
        Message<?> msg = buildStompMessage(StompCommand.CONNECT, "Token abc");
        assertThat(interceptor.preSend(msg, channel)).isNotNull();
    }
}

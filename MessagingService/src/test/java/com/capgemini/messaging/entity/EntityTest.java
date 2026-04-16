package com.capgemini.messaging.entity;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EntityTest {

    @Test
    void message_prePersist_shouldSetCreatedAt() throws Exception {
        Message message = new Message();
        Method onCreate = Message.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(message);

        assertThat(message.getCreatedAt()).isNotNull();
        assertThat(message.getCreatedAt()).isBefore(LocalDateTime.now().plusSeconds(1));
    }

    @Test
    void message_builder_shouldSetAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Message message = Message.builder()
                .id(1L)
                .conversationId(10L)
                .senderId(5L)
                .content("Hello world")
                .createdAt(now)
                .build();

        assertThat(message.getId()).isEqualTo(1L);
        assertThat(message.getConversationId()).isEqualTo(10L);
        assertThat(message.getSenderId()).isEqualTo(5L);
        assertThat(message.getContent()).isEqualTo("Hello world");
        assertThat(message.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void conversation_prePersist_shouldSetCreatedAt() throws Exception {
        Conversation conversation = new Conversation();
        Method onCreate = Conversation.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(conversation);

        assertThat(conversation.getCreatedAt()).isNotNull();
        assertThat(conversation.getCreatedAt()).isBefore(LocalDateTime.now().plusSeconds(1));
    }

    @Test
    void conversation_builder_shouldSetAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Conversation conversation = Conversation.builder()
                .id(100L)
                .participant1Id(1L)
                .participant2Id(2L)
                .createdAt(now)
                .build();

        assertThat(conversation.getId()).isEqualTo(100L);
        assertThat(conversation.getParticipant1Id()).isEqualTo(1L);
        assertThat(conversation.getParticipant2Id()).isEqualTo(2L);
        assertThat(conversation.getCreatedAt()).isEqualTo(now);
    }
}
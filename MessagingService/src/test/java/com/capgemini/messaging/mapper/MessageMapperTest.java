package com.capgemini.messaging.mapper;

import com.capgemini.messaging.dto.ConversationResponse;
import com.capgemini.messaging.dto.MessageResponse;
import com.capgemini.messaging.entity.Conversation;
import com.capgemini.messaging.entity.Message;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MessageMapperTest {

    private final MessageMapper mapper = new MessageMapper();

    @Test
    void toMessageResponse_shouldMapAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Message message = Message.builder()
                .id(200L)
                .conversationId(100L)
                .senderId(1L)
                .content("Hello!")
                .createdAt(now)
                .build();

        MessageResponse response = mapper.toMessageResponse(message);

        assertThat(response.getId()).isEqualTo(200L);
        assertThat(response.getConversationId()).isEqualTo(100L);
        assertThat(response.getSenderId()).isEqualTo(1L);
        assertThat(response.getContent()).isEqualTo("Hello!");
        assertThat(response.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void toConversationResponse_shouldMapAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Conversation conversation = Conversation.builder()
                .id(100L)
                .participant1Id(1L)
                .participant2Id(2L)
                .createdAt(now)
                .build();

        MessageResponse msg = MessageResponse.builder()
                .id(1L).conversationId(100L).senderId(1L).content("Hi").createdAt(now).build();

        ConversationResponse response = mapper.toConversationResponse(conversation, List.of(msg));

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getParticipant1Id()).isEqualTo(1L);
        assertThat(response.getParticipant2Id()).isEqualTo(2L);
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getMessages()).hasSize(1);
        assertThat(response.getMessages().get(0).getContent()).isEqualTo("Hi");
    }

    @Test
    void toConversationResponse_withEmptyMessages_shouldReturnEmptyList() {
        Conversation conversation = Conversation.builder()
                .id(100L)
                .participant1Id(1L)
                .participant2Id(2L)
                .createdAt(LocalDateTime.now())
                .build();

        ConversationResponse response = mapper.toConversationResponse(conversation, List.of());

        assertThat(response.getMessages()).isEmpty();
    }
}

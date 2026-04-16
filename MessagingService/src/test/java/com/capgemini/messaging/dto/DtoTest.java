package com.capgemini.messaging.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DtoTest {

    @Test
    void apiResponse_success_shouldBuildCorrectly() {
        ApiResponse<String> response = ApiResponse.success("Operation done", "payload");

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getMessage()).isEqualTo("Operation done");
        assertThat(response.getData()).isEqualTo("payload");
    }

    @Test
    void apiResponse_error_shouldBuildCorrectly() {
        ApiResponse<Void> response = ApiResponse.error(404, "Not found");

        assertThat(response.getStatus()).isEqualTo(404);
        assertThat(response.getMessage()).isEqualTo("Not found");
        assertThat(response.getData()).isNull();
    }

    @Test
    void chatMessageDto_builder_shouldSetAllFields() {
        LocalDateTime now = LocalDateTime.now();
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(1L)
                .conversationId(10L)
                .senderId(5L)
                .content("Hello!")
                .createdAt(now)
                .build();

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getConversationId()).isEqualTo(10L);
        assertThat(dto.getSenderId()).isEqualTo(5L);
        assertThat(dto.getContent()).isEqualTo("Hello!");
        assertThat(dto.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void chatMessageDto_noArgsConstructor_shouldWork() {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setContent("Test");
        assertThat(dto.getContent()).isEqualTo("Test");
    }

    @Test
    void messageRequest_builder_shouldSetAllFields() {
        MessageRequest req = new MessageRequest(2L, "Hi there");
        assertThat(req.getReceiverId()).isEqualTo(2L);
        assertThat(req.getContent()).isEqualTo("Hi there");
    }
}

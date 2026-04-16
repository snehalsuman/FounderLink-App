package com.capgemini.team.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAccessDenied_shouldReturn403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("status")).isEqualTo(403);
    }

    @Test
    void handleResourceNotFound_shouldReturn404() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleResourceNotFound(new ResourceNotFoundException("Team member not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("message")).isEqualTo("Team member not found");
    }

    @Test
    void handleUnauthorized_shouldReturn403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleUnauthorized(new UnauthorizedException("Not the founder"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("message")).isEqualTo("Not the founder");
    }

    @Test
    void handleDuplicate_shouldReturn409() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDuplicate(new DuplicateResourceException("Already a team member"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("status")).isEqualTo(409);
    }

    @Test
    void handleBadRequest_shouldReturn400() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequest(new BadRequestException("Invitation not in PENDING state"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("message")).isEqualTo("Invitation not in PENDING state");
    }

    @Test
    void handleServiceUnavailable_shouldReturn503() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleServiceUnavailable(new ServiceUnavailableException("Startup service unavailable"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().get("status")).isEqualTo(503);
    }

    @Test
    void handleValidation_shouldReturn400WithFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult br = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(br);
        when(br.getFieldErrors()).thenReturn(List.of(new FieldError("req", "startupId", "must not be null")));

        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsKey("startupId");
    }

    @Test
    void handleGeneral_shouldReturn500() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleGeneral(new RuntimeException("Unexpected"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().get("status")).isEqualTo(500);
    }
}

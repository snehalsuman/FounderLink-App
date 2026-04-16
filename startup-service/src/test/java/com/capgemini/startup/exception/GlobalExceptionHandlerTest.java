package com.capgemini.startup.exception;

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
    void handleResourceNotFound_shouldReturn404() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleResourceNotFound(new ResourceNotFoundException("Startup not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("status")).isEqualTo(404);
        assertThat(response.getBody().get("message")).isEqualTo("Startup not found");
    }

    @Test
    void handleDuplicateResource_shouldReturn409() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleDuplicateResource(new DuplicateResourceException("Startup already exists"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("status")).isEqualTo(409);
    }

    @Test
    void handleUnauthorizedAccess_shouldReturn403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleUnauthorizedAccess(new UnauthorizedAccessException("Not the founder"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("message")).isEqualTo("Not the founder");
    }

    @Test
    void handleAccessDenied_shouldReturn403() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDenied(new AccessDeniedException("denied"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("message")).isEqualTo("Access denied");
    }

    @Test
    void handleValidationErrors_shouldReturn400WithFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult br = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(br);
        when(br.getFieldErrors()).thenReturn(List.of(new FieldError("req", "name", "must not be blank")));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationErrors(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsKey("name");
    }

    @Test
    void handleGenericException_shouldReturn500() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleGenericException(new RuntimeException("Internal error"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().get("status")).isEqualTo(500);
    }
}
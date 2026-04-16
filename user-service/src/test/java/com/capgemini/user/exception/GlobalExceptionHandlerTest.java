package com.capgemini.user.exception;

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
        ResourceNotFoundException ex = new ResourceNotFoundException("Profile not found");

        ResponseEntity<Map<String, Object>> response = handler.handleResourceNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("status")).isEqualTo(404);
        assertThat(response.getBody().get("message")).isEqualTo("Profile not found");
    }

    @Test
    void handleDuplicateResource_shouldReturn409() {
        DuplicateResourceException ex = new DuplicateResourceException("Email already in use");

        ResponseEntity<Map<String, Object>> response = handler.handleDuplicateResource(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("status")).isEqualTo(409);
        assertThat(response.getBody().get("message")).isEqualTo("Email already in use");
    }

    @Test
    void handleValidationErrors_shouldReturn400WithFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("userProfileRequest", "name", "must not be blank");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationErrors(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("status")).isEqualTo(400);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsKey("name");
    }

    @Test
    void handleAccessDenied_shouldReturn403() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden");

        ResponseEntity<Map<String, Object>> response = handler.handleAccessDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("status")).isEqualTo(403);
        assertThat(response.getBody().get("message")).isEqualTo("Access denied");
    }

    @Test
    void handleGenericException_shouldReturn500() {
        Exception ex = new RuntimeException("Something went wrong");

        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().get("status")).isEqualTo(500);
        assertThat(response.getBody().get("message")).isEqualTo("Something went wrong");
    }
}
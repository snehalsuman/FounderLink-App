package com.capgemini.investment.exception;

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
                handler.handleAccessDenied(new AccessDeniedException("no"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().get("status")).isEqualTo(403);
        assertThat((String) response.getBody().get("message")).contains("permission");
    }

    @Test
    void handleResourceNotFound_shouldReturn404() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleResourceNotFound(new ResourceNotFoundException("Investment not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("status")).isEqualTo(404);
        assertThat(response.getBody().get("message")).isEqualTo("Investment not found");
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
                handler.handleDuplicate(new DuplicateResourceException("Already invested"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("status")).isEqualTo(409);
    }

    @Test
    void handleServiceUnavailable_shouldReturn503() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleServiceUnavailable(new ServiceUnavailableException("Startup service down"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().get("status")).isEqualTo(503);
    }

    @Test
    void handleBadRequest_shouldReturn400() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequest(new BadRequestException("Investment not in PENDING state"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("message")).isEqualTo("Investment not in PENDING state");
    }

    @Test
    void handleValidation_shouldReturn400WithFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult br = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(br);
        when(br.getFieldErrors()).thenReturn(List.of(new FieldError("req", "amount", "must be positive")));

        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsKey("amount");
    }

    @Test
    void handleGeneral_shouldReturn500() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleGeneral(new RuntimeException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().get("status")).isEqualTo(500);
    }
}
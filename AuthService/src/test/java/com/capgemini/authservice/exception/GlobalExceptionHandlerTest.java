package com.capgemini.authservice.exception;

import com.capgemini.authservice.dto.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleCustomException_shouldReturnCorrectStatusAndMessage() {
        CustomException ex = new CustomException("Email already registered", HttpStatus.CONFLICT);

        ResponseEntity<ApiResponse<Void>> response = handler.handleCustomException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("Email already registered");
        assertThat(response.getBody().getStatus()).isEqualTo(409);
    }

    @Test
    void handleCustomException_withUnauthorized_shouldReturn401() {
        CustomException ex = new CustomException("Invalid credentials", HttpStatus.UNAUTHORIZED);

        ResponseEntity<ApiResponse<Void>> response = handler.handleCustomException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().getStatus()).isEqualTo(401);
    }

    @Test
    void handleValidationException_shouldReturn400WithFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("obj", "email", "must not be blank");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).contains("email");
    }

    @Test
    void handleGenericException_shouldReturn500() {
        Exception ex = new RuntimeException("Unexpected failure");

        ResponseEntity<ApiResponse<Void>> response = handler.handleGenericException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getStatus()).isEqualTo(500);
        assertThat(response.getBody().getMessage()).contains("unexpected error");
    }
}
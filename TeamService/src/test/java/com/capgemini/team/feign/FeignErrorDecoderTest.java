package com.capgemini.team.feign;

import com.capgemini.team.exception.ResourceNotFoundException;
import feign.Request;
import feign.Response;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

class FeignErrorDecoderTest {

    private final FeignErrorDecoder decoder = new FeignErrorDecoder();

    private Response buildResponse(int status) {
        return Response.builder()
                .status(status)
                .reason("reason")
                .request(Request.create(
                        Request.HttpMethod.GET,
                        "/test",
                        Collections.emptyMap(),
                        null,
                        StandardCharsets.UTF_8,
                        null
                ))
                .headers(Collections.emptyMap())
                .build();
    }

    @Test
    void decode_with404Status_shouldReturnResourceNotFoundException() {
        Response response = buildResponse(404);

        Exception ex = decoder.decode("TeamClient#method()", response);

        assertThat(ex).isInstanceOf(ResourceNotFoundException.class);
        assertThat(ex.getMessage()).contains("not found");
    }

    @Test
    void decode_with500Status_shouldReturnDefaultException() {
        Response response = buildResponse(500);

        Exception ex = decoder.decode("TeamClient#method()", response);

        assertThat(ex).isNotInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void decode_with403Status_shouldReturnDefaultException() {
        Response response = buildResponse(403);

        Exception ex = decoder.decode("TeamClient#method()", response);

        assertThat(ex).isNotInstanceOf(ResourceNotFoundException.class);
    }
}
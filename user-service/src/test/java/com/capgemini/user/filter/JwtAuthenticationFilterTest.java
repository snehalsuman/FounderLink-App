package com.capgemini.user.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_withXUserHeaders_shouldSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("7");
        when(request.getHeader("X-User-Roles")).thenReturn("ROLE_INVESTOR");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("7");
    }

    @Test
    void doFilterInternal_withMultipleRoles_shouldSetAllAuthorities() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("3");
        when(request.getHeader("X-User-Roles")).thenReturn("ROLE_FOUNDER, ROLE_ADMIN");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities()).hasSize(2);
    }

    @Test
    void doFilterInternal_withNoHeadersNoBearer_shouldPassThroughWithoutAuth() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withValidBearerToken_shouldSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
        when(jwtUtil.validateToken("valid.token.here")).thenReturn(true);
        when(jwtUtil.extractUserId("valid.token.here")).thenReturn(15L);
        when(jwtUtil.extractRoles("valid.token.here")).thenReturn(List.of("ROLE_FOUNDER"));

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("15");
    }

    @Test
    void doFilterInternal_withInvalidBearerToken_shouldNotSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer bad.token");
        when(jwtUtil.validateToken("bad.token")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withNonBearerAuthHeader_shouldPassThroughWithoutAuth() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}

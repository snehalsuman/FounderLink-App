package com.capgemini.startup.filter;

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
        when(request.getHeader("X-User-Id")).thenReturn("8");
        when(request.getHeader("X-User-Roles")).thenReturn("ROLE_FOUNDER");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("8");
    }

    @Test
    void doFilterInternal_withBlankRolesHeader_shouldFallThrough() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("1");
        when(request.getHeader("X-User-Roles")).thenReturn("  ");
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withNoHeaders_shouldPassThroughWithoutAuth() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withNonBearerAuth_shouldPassThrough() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Basic abc");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withValidBearerToken_shouldSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer startup.token");
        when(jwtUtil.validateToken("startup.token")).thenReturn(true);
        when(jwtUtil.extractUserId("startup.token")).thenReturn(12L);
        when(jwtUtil.extractRoles("startup.token")).thenReturn(List.of("ROLE_FOUNDER"));

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("12");
    }

    @Test
    void doFilterInternal_withInvalidBearerToken_shouldNotSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid");
        when(jwtUtil.validateToken("invalid")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}

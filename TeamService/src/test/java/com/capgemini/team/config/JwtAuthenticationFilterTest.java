package com.capgemini.team.config;

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
        when(request.getHeader("X-User-Id")).thenReturn("11");
        when(request.getHeader("X-User-Roles")).thenReturn("ROLE_FOUNDER");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(11L);
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
        when(request.getHeader("Authorization")).thenReturn("Token abc");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withValidBearerToken_shouldSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer team.token");
        when(jwtUtil.validateToken("team.token")).thenReturn(true);
        when(jwtUtil.extractUserId("team.token")).thenReturn(25L);
        when(jwtUtil.extractRoles("team.token")).thenReturn(List.of("ROLE_CO_FOUNDER"));

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(25L);
    }

    @Test
    void doFilterInternal_withInvalidBearerToken_shouldNotSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);
        when(request.getHeader("Authorization")).thenReturn("Bearer expired");
        when(jwtUtil.validateToken("expired")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}

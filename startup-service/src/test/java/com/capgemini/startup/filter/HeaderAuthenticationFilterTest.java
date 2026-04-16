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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HeaderAuthenticationFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private HeaderAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_withXUserHeaders_shouldSetAuthentication() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("5");
        when(request.getHeader("X-User-Roles")).thenReturn("ROLE_FOUNDER");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo("5");
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
    void doFilterInternal_withNoHeaders_shouldPassThroughWithoutAuth() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Roles")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void doFilterInternal_withUserIdButNoRoles_shouldPassThroughWithoutAuth() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("1");
        when(request.getHeader("X-User-Roles")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
package org.hk.flixly.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import io.jsonwebtoken.JwtException;
import org.hk.flixly.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String SESSION_EXPIRED_BODY =
            "{\"message\":\"Oturumun süresi doldu. Tekrar giriş yap.\",\"code\":\"SESSION_EXPIRED\"}";
    private static final String SERVER_ERROR_BODY =
            "{\"message\":\"İstek tamamlanamadı.\",\"code\":\"SERVER_ERROR\"}";
    private final HandlerExceptionResolver handlerExceptionResolver;

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            HandlerExceptionResolver handlerExceptionResolver
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String username = jwtService.extractUsername(jwt);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (username != null && authentication == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);
        } catch (JwtException exception) {
            // Expired or malformed tokens used to fall through to sendError(500).
            // With include-message=always that response body is "No message available".
            log.warn("Rejected JWT on {} {}: {}", request.getMethod(), request.getRequestURI(), exception.getClass().getSimpleName());
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, SESSION_EXPIRED_BODY);
        } catch (Exception exception) {
            log.error("Authenticated request failed: {} {}", request.getMethod(), request.getRequestURI(), exception);
            if (!response.isCommitted()) {
                handlerExceptionResolver.resolveException(request, response, null, exception);
            }
            if (!response.isCommitted()) {
                writeJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, SERVER_ERROR_BODY);
            }
        }
    }

    private void writeJson(HttpServletResponse response, int status, String json) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(json);
    }
}

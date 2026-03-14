package com.example.financeTracker.security;

import com.example.financeTracker.Repository.UserRepository;
import com.example.financeTracker.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserAuthenticationFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER = "X-USER-ID";

    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String rawUserId = request.getHeader(USER_ID_HEADER);
            if (rawUserId == null || rawUserId.isBlank()) {
                throw new UnauthorizedException("Missing X-USER-ID header");
            }

            UUID userId;
            try {
                userId = UUID.fromString(rawUserId);
            } catch (IllegalArgumentException exception) {
                throw new UnauthorizedException("Invalid X-USER-ID header");
            }

            if (!userRepository.existsById(userId)) {
                throw new UnauthorizedException("Authenticated user does not exist");
            }

            CurrentUserContext.setUserId(userId);
            log.debug("Authenticated request for user {}", userId);
            filterChain.doFilter(request, response);
        } finally {
            CurrentUserContext.clear();
        }
    }
}

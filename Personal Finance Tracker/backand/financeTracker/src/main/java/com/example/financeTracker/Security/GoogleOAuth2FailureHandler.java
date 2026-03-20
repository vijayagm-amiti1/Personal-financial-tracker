package com.example.financeTracker.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GoogleOAuth2FailureHandler implements AuthenticationFailureHandler {

    @Value("${app.auth.google_failure_redirect_url}")
    private String googleFailureRedirectUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        String separator = googleFailureRedirectUrl.contains("?") ? "&" : "?";
        String redirectUrl = googleFailureRedirectUrl + separator + "error="
                + URLEncoder.encode("Google login failed. Try again.", StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}

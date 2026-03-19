package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.RequestDTO.IssueReportRequest;
import com.example.financeTracker.DTO.ResponseDTO.AuthMessageResponse;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Slf4j
public class SupportController {

    private final SupportService supportService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping("/report-issue")
    public ResponseEntity<AuthMessageResponse> reportIssue(@Valid @RequestBody IssueReportRequest request,
                                                           Authentication authentication) {
        String email = currentUserProvider.getCurrentEmail(authentication);
        log.info("Received issue report request from {}", email);
        supportService.reportIssue(email, request);
        return ResponseEntity.ok(new AuthMessageResponse("Issue report sent successfully."));
    }
}

package com.example.financeTracker.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IssueReportRequest(
        @NotBlank(message = "Subject is required.")
        @Size(max = 120, message = "Subject must be 120 characters or fewer.")
        String subject,

        @Size(max = 160, message = "Page must be 160 characters or fewer.")
        String page,

        @NotBlank(message = "Issue details are required.")
        @Size(max = 4000, message = "Issue details must be 4000 characters or fewer.")
        String message
) {
}

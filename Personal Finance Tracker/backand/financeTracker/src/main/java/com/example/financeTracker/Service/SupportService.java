package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.RequestDTO.IssueReportRequest;

public interface SupportService {

    void reportIssue(String currentUserEmail, IssueReportRequest request);
}

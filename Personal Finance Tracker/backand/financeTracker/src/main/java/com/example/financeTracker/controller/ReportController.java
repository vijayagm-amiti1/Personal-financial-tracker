package com.example.financeTracker.controller;

import com.example.financeTracker.DTO.ResponseDTO.CategorySpendingReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.DailyReportDTO;
import com.example.financeTracker.Security.CurrentUserProvider;
import com.example.financeTracker.Service.ReportService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/monthly-daily")
    public ResponseEntity<List<DailyReportDTO>> getMonthlyDailyReport(Authentication authentication,
                                                                      @RequestParam UUID accountId,
                                                                      @RequestParam int month,
                                                                      @RequestParam int year) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received monthly daily report request for user {}, account {}, month {}, year {}",
                userId, accountId, month, year);
        List<DailyReportDTO> response = reportService.getMonthlyDailyReport(userId, accountId, month, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-category-spending")
    public ResponseEntity<List<CategorySpendingReportDTO>> getMonthlyCategorySpendingReport(Authentication authentication,
                                                                                            @RequestParam UUID accountId,
                                                                                            @RequestParam int month,
                                                                                            @RequestParam int year) {
        UUID userId = currentUserProvider.getCurrentUserId(authentication);
        log.info("Received monthly category spending report request for user {}, account {}, month {}, year {}",
                userId, accountId, month, year);
        List<CategorySpendingReportDTO> response =
                reportService.getMonthlyCategorySpendingReport(userId, accountId, month, year);
        return ResponseEntity.ok(response);
    }
}

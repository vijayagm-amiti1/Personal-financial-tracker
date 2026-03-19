package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.CategorySpendingReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.DailyReportDTO;
import java.util.List;
import java.util.UUID;

public interface ReportService {

    List<DailyReportDTO> getMonthlyDailyReport(UUID userId, UUID accountId, int month, int year);

    List<CategorySpendingReportDTO> getMonthlyCategorySpendingReport(UUID userId, UUID accountId, int month, int year);
}

package com.example.financeTracker.Service;

import com.example.financeTracker.DTO.ResponseDTO.CategorySpendingReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.DailyReportDTO;
import com.example.financeTracker.DTO.ResponseDTO.NetWorthReportResponseDTO;
import com.example.financeTracker.DTO.ResponseDTO.TrendReportResponseDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportService {

    List<DailyReportDTO> getMonthlyDailyReport(UUID userId, UUID accountId, int month, int year);

    List<CategorySpendingReportDTO> getMonthlyCategorySpendingReport(UUID userId, UUID accountId, int month, int year);

    TrendReportResponseDTO getTrendReport(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId, UUID categoryId);

    NetWorthReportResponseDTO getNetWorthReport(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId);
}

package com.example.financeTracker.ServiceImpl;

import com.example.financeTracker.DTO.ResponseDTO.InsightItemDTO;
import com.example.financeTracker.DTO.ResponseDTO.InsightsResponseDTO;
import com.example.financeTracker.DTO.ResponseDTO.NetWorthPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.NetWorthReportResponseDTO;
import com.example.financeTracker.DTO.ResponseDTO.TrendMetricPointDTO;
import com.example.financeTracker.DTO.ResponseDTO.TrendReportResponseDTO;
import com.example.financeTracker.Service.InsightsService;
import com.example.financeTracker.Service.ReportService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InsightsServiceImpl implements InsightsService {

    private final ReportService reportService;

    @Override
    public InsightsResponseDTO getInsights(UUID userId, LocalDate fromDate, LocalDate toDate, UUID accountId, UUID categoryId) {
        TrendReportResponseDTO trends = reportService.getTrendReport(userId, fromDate, toDate, accountId, categoryId);
        NetWorthReportResponseDTO netWorth = reportService.getNetWorthReport(userId, fromDate, toDate, accountId);
        List<TrendMetricPointDTO> monthlySummary = trends.getMonthlySummary();
        List<InsightItemDTO> insights = new ArrayList<>();

        if (monthlySummary.size() >= 2) {
            TrendMetricPointDTO current = monthlySummary.get(monthlySummary.size() - 1);
            TrendMetricPointDTO previous = monthlySummary.get(monthlySummary.size() - 2);

            addExpenseChangeInsight(insights, current, previous);
            addSavingsRateInsight(insights, current, previous);
        }

        trends.getCategoryTrends().stream()
                .max(Comparator.comparingDouble(series -> series.getPoints().isEmpty()
                        ? 0
                        : series.getPoints().get(series.getPoints().size() - 1).getExpense()))
                .ifPresent(topCategory -> {
                    double latestExpense = topCategory.getPoints().isEmpty()
                            ? 0
                            : topCategory.getPoints().get(topCategory.getPoints().size() - 1).getExpense();

                    if (latestExpense > 0) {
                        insights.add(InsightItemDTO.builder()
                                .type("top_category")
                                .severity("info")
                                .title("Highest spending category")
                                .message(String.format("%s is your highest spending category in the latest month at ₹%.2f.",
                                        topCategory.getCategoryName(), latestExpense))
                                .amount(latestExpense)
                                .build());
                    }
                });

        List<NetWorthPointDTO> netWorthPoints = netWorth.getPoints();
        if (netWorthPoints.size() >= 2) {
            NetWorthPointDTO currentPoint = netWorthPoints.get(netWorthPoints.size() - 1);
            NetWorthPointDTO previousPoint = netWorthPoints.get(netWorthPoints.size() - 2);
            double delta = currentPoint.getNetWorth() - previousPoint.getNetWorth();

            if (Math.abs(delta) > 0.01) {
                insights.add(InsightItemDTO.builder()
                        .type("net_worth_change")
                        .severity(delta >= 0 ? "positive" : "warning")
                        .title(delta >= 0 ? "Net worth improved" : "Net worth declined")
                        .message(String.format("Your net worth %s by ₹%.2f compared with the previous month.",
                                delta >= 0 ? "improved" : "declined", Math.abs(delta)))
                        .amount(delta)
                        .build());
            }
        }

        if (insights.isEmpty()) {
            insights.add(InsightItemDTO.builder()
                    .type("insufficient_data")
                    .severity("info")
                    .title("More activity needed")
                    .message("Add more transactions over time to unlock stronger trend insights.")
                    .build());
        }

        insights.sort((left, right) -> severityRank(right.getSeverity()) - severityRank(left.getSeverity()));

        double currentSavingsRate = monthlySummary.isEmpty() ? 0 : monthlySummary.get(monthlySummary.size() - 1).getSavingsRate();

        return InsightsResponseDTO.builder()
                .fromDate(trends.getFromDate())
                .toDate(trends.getToDate())
                .currentSavingsRate(currentSavingsRate)
                .currentNetWorth(netWorth.getCurrentNetWorth())
                .insights(insights)
                .build();
    }

    private void addExpenseChangeInsight(List<InsightItemDTO> insights, TrendMetricPointDTO current, TrendMetricPointDTO previous) {
        if (previous.getExpense() <= 0 || current.getExpense() <= 0) {
            return;
        }

        double deltaPercent = ((current.getExpense() - previous.getExpense()) / previous.getExpense()) * 100;
        if (Math.abs(deltaPercent) < 10) {
            return;
        }

        insights.add(InsightItemDTO.builder()
                .type("expense_change")
                .severity(deltaPercent > 0 ? "warning" : "positive")
                .title(deltaPercent > 0 ? "Spending increased" : "Spending decreased")
                .message(String.format("Your spending changed by %.1f%% in %s compared with %s.",
                        Math.abs(deltaPercent), current.getPeriodLabel(), previous.getPeriodLabel()))
                .changePercent(deltaPercent)
                .amount(current.getExpense())
                .build());
    }

    private void addSavingsRateInsight(List<InsightItemDTO> insights, TrendMetricPointDTO current, TrendMetricPointDTO previous) {
        double delta = current.getSavingsRate() - previous.getSavingsRate();
        if (Math.abs(delta) < 2) {
            return;
        }

        insights.add(InsightItemDTO.builder()
                .type("savings_rate")
                .severity(delta >= 0 ? "positive" : "warning")
                .title(delta >= 0 ? "You saved more than last month" : "Savings rate dropped")
                .message(String.format("Savings rate moved from %.1f%% to %.1f%%.",
                        previous.getSavingsRate(), current.getSavingsRate()))
                .changePercent(delta)
                .amount(current.getSavingsRate())
                .build());
    }

    private int severityRank(String severity) {
        return switch (severity) {
            case "warning" -> 3;
            case "positive" -> 2;
            default -> 1;
        };
    }
}

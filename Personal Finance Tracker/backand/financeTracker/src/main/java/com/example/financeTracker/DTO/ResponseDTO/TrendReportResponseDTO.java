package com.example.financeTracker.DTO.ResponseDTO;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendReportResponseDTO {

    private LocalDate fromDate;
    private LocalDate toDate;
    private List<TrendMetricPointDTO> monthlySummary;
    private List<CategoryTrendSeriesDTO> categoryTrends;
}

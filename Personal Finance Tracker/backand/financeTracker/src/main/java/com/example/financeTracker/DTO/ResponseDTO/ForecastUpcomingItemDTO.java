package com.example.financeTracker.DTO.ResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastUpcomingItemDTO {

    private LocalDate date;
    private String title;
    private String type;
    private BigDecimal amount;
    private String source;
}

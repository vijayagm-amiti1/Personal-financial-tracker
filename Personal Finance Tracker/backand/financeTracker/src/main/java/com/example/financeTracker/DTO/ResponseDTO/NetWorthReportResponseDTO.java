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
public class NetWorthReportResponseDTO {

    private LocalDate fromDate;
    private LocalDate toDate;
    private double currentNetWorth;
    private double changeAmount;
    private List<NetWorthPointDTO> points;
}

package com.example.financeTracker.DTO.ResponseDTO;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryTrendSeriesDTO {

    private UUID categoryId;
    private String categoryName;
    private double totalExpense;
    private List<CategoryTrendPointDTO> points;
}

package com.intellispend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyFeedbackRequest {
    private String feedback; // CONFIRMED, FALSE_POSITIVE, DISMISSED
}

package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogDuplicateCheckDto {
    private boolean hasDuplicates;
    @Builder.Default
    private List<CatalogDuplicateMatchDto> matches = new ArrayList<>();
}

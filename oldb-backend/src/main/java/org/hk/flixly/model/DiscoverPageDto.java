package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscoverPageDto {
    @Builder.Default
    private List<DiscoverBookDto> content = new ArrayList<>();
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    @Builder.Default
    private List<String> availableGenres = new ArrayList<>();
    @Builder.Default
    private List<String> availableLanguages = new ArrayList<>();
}

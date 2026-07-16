package org.hk.flixly.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscoverFeedDto {
    @Builder.Default
    private List<DiscoverBookDto> trending = new ArrayList<>();
    @Builder.Default
    private List<DiscoverBookDto> editorChoice = new ArrayList<>();
    @Builder.Default
    private List<DiscoverBookDto> weekMostRead = new ArrayList<>();
    @Builder.Default
    private List<DiscoverBookDto> newReleases = new ArrayList<>();
    @Builder.Default
    private List<DiscoverBookDto> rising = new ArrayList<>();
}

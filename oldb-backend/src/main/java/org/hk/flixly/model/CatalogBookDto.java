package org.hk.flixly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogBookDto {
    private Long id;
    private String title;
    private String originalTitle;
    private Long authorId;
    private String authorName;
    private Integer pageCount;
    private String coverUrl;
    private String description;
    private int year;
    private String isbn;
    private String genres;
    private String language;
    private String adminNotes;
    private String editorNotes;

    @JsonProperty("isEditorChoice")
    private boolean editorChoice;
    @JsonProperty("isWeeklyPick")
    private boolean weeklyPick;
    @JsonProperty("isNewRelease")
    private boolean newRelease;

    private String createdBy;
    private String createdAt;
    private String updatedBy;
    private String updatedAt;
}

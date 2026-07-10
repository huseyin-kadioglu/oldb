package org.hk.flixly.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityStatsDto {
    /** Bu takvim ayında okunan kitap sayısı (READ aktiviteleri) */
    private long booksReadThisMonth;
    /** Son 30 günde okunan kitap sayısı */
    private long booksReadLast30Days;
    /** Aktif (hesabı açılmış) üye sayısı */
    private long activeMembers;
    /** Bu ay en az bir kitap okuyan üye sayısı */
    private long readersThisMonth;
    /** Son 30 günde en çok okunan kitaplar */
    private List<CommunityBookDto> booksReadThisMonthList;
}

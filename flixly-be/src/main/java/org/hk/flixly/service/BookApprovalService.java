package org.hk.flixly.service;

import lombok.extern.slf4j.Slf4j;
import org.hk.flixly.model.BookApprovalDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.BookApprovalEntity;
import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.BookApprovalRepository;
import org.hk.flixly.repository.BookRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class BookApprovalService {

    private final BookApprovalRepository bookApprovalRepository;
    private final BookRepository bookRepository;

    public BookApprovalService(BookApprovalRepository bookApprovalRepository, BookRepository bookRepository) {
        this.bookApprovalRepository = bookApprovalRepository;
        this.bookRepository = bookRepository;
    }

    public BookApprovalEntity contributeBook(BookApprovalDto dto, UserDetails userDetails) {

        if (userDetails == null) {
            log.info("user bilgisi boş");
            return null;
        }

        BookEntity isExist = bookRepository.findByTitleAndPublicationYear(dto.getTitle(), dto.getPublicationYear());
        if (isExist != null) {
            log.info("kitap ekli");
            return null;
        }
        BookApprovalEntity entity = new BookApprovalEntity();
        entity.setDescription(dto.getDescription());
        entity.setContributedUser(userDetails.getUsername());
        entity.setOriginalTitle(dto.getOriginalTitle());
        entity.setYear(dto.getPublicationYear());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setStatus("PENDING");
        entity.setTitle(dto.getTitle());
        entity.setPageCount(dto.getPageCount());
        entity.setAuthorId(dto.getAuthorId());
        return bookApprovalRepository.save(entity);
    }

    public List<BookApprovalEntity> getApprovals(UserDetails userDetails) {
        String role = ((UserEntity) userDetails).getRole();
        if (role.equals("admin")) {
            return bookApprovalRepository.findAll();
        }

        return Collections.emptyList();
    }
}

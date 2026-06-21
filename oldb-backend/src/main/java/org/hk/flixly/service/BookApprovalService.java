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
    private final BookService bookService;
    private final UserService userService;


    public BookApprovalService(BookApprovalRepository bookApprovalRepository, BookRepository bookRepository, BookService bookService, UserService userService) {
        this.bookApprovalRepository = bookApprovalRepository;
        this.bookRepository = bookRepository;
        this.bookService = bookService;
        this.userService = userService;
    }

    public BookApprovalEntity contributeBook(BookApprovalDto dto, UserDetails userDetails) {

        if (userDetails == null) {
            log.info("user bilgisi boş");
            return null;
        }

        BookEntity isExist = bookRepository.findByTitleAndPublicationYear(dto.getTitle(), dto.getYear());
        if (isExist != null) {
            log.info("kitap ekli");
            return null;
        }
        BookApprovalEntity entity = new BookApprovalEntity();
        entity.setDescription(dto.getDescription());
        entity.setContributedUser(userDetails.getUsername());
        entity.setOriginalTitle(dto.getOriginalTitle());
        entity.setYear(dto.getYear());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setCoverUrl(dto.getCoverUrl());
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

    public void rejectApproval(Long id) {
        bookApprovalRepository.deleteById(id);
    }

    public void approve(BookApprovalDto dto, UserDetails userDetails) {
        bookService.createApprovedBook(dto);

        UserEntity contributedUser = userService.loadUserByUsername(userDetails.getUsername());
        contributedUser.setContributionPoint(contributedUser.getContributionPoint() + 1);
        userService.save(contributedUser);

        // burada bilgileri return edebiliriz.
    }
}

package org.hk.flixly.controller;

import org.hk.flixly.model.BookApprovalDto;
import org.hk.flixly.model.entity.BookApprovalEntity;
import org.hk.flixly.service.BookApprovalService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/book-approvals")
public class BookApprovalController {

    private final BookApprovalService bookApprovalService;

    public BookApprovalController(BookApprovalService bookApprovalService) {
        this.bookApprovalService = bookApprovalService;
    }

    @PostMapping
    public void contributeBook(@AuthenticationPrincipal UserDetails userDetails, @RequestBody BookApprovalDto dto) {
        bookApprovalService.contributeBook(dto, userDetails);
    }

    @GetMapping()
    public List<BookApprovalEntity> approval(@AuthenticationPrincipal UserDetails userDetails) {
        return bookApprovalService.getApprovals(userDetails);
    }
}

package org.hk.flixly.controller;

import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.entity.AuthorApprovalEntity;
import org.hk.flixly.service.AuthorApprovalService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/author-approvals")
public class AuthorApprovalController {

    private final AuthorApprovalService authorApprovalService;

    public AuthorApprovalController(AuthorApprovalService authorApprovalService) {
        this.authorApprovalService = authorApprovalService;
    }

    @PostMapping
    public void contributeAuthor(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AuthorApprovalDto dto) {
        authorApprovalService.contributeAuthor(dto, userDetails);
    }

    @GetMapping()
    public List<AuthorApprovalEntity> approval(@AuthenticationPrincipal UserDetails userDetails) {
        return authorApprovalService.getApprovals(userDetails);
    }

    @DeleteMapping
    public void rejectApproval(@RequestBody Long id) {
        authorApprovalService.rejectApproval(id);
    }
}

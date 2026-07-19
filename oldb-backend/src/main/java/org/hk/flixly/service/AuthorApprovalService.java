package org.hk.flixly.service;

import lombok.extern.slf4j.Slf4j;
import org.hk.flixly.model.AuthorApprovalDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.AuthorApprovalEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.AuthorApprovalRepository;
import org.hk.flixly.repository.AuthorRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class AuthorApprovalService {

    private final AuthorApprovalRepository authorApprovalRepository;
    private final AuthorRepository authorRepository;
    private final AuthorService authorService;
    private final UserService userService;

    public AuthorApprovalService(AuthorApprovalRepository authorApprovalRepository, AuthorRepository authorRepository, AuthorService authorService, UserService userService) {
        this.authorApprovalRepository = authorApprovalRepository;
        this.authorRepository = authorRepository;
        this.authorService = authorService;
        this.userService = userService;
    }

    public AuthorApprovalEntity contributeAuthor(AuthorApprovalDto dto, UserDetails userDetails) {

        if (userDetails == null) {
            log.info("user bilgisi boş");
            return null;
        }

        AuthorApprovalEntity entity = new AuthorApprovalEntity();
        entity.setName(dto.getName());
        entity.setBirthYear(dto.getBirthYear());
        entity.setDeathYear(dto.getDeathYear());
        entity.setPortrait(dto.getPortrait());
        entity.setDescription(dto.getDescription());
        entity.setContributedUser(userDetails.getUsername());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setStatus("PENDING");
        return authorApprovalRepository.save(entity);
    }

    public List<AuthorApprovalEntity> getApprovals(UserDetails userDetails) {
        String role = ((UserEntity) userDetails).getRole();
        if (UserRole.isStaff(role)) {
            return authorApprovalRepository.findAll();
        }

        return Collections.emptyList();
    }

    public void rejectApproval(Long id) {
        authorApprovalRepository.deleteById(id);
    }

    public void approve(AuthorApprovalDto dto, UserDetails userDetails) {
        authorService.createApprovedAuthor(dto);

        if (dto.getId() != null) {
            authorApprovalRepository.findById(dto.getId()).ifPresent(approval -> {
                awardContributionPoint(approval.getContributedUser());
                authorApprovalRepository.deleteById(dto.getId());
            });
        }
    }

    private void awardContributionPoint(String username) {
        if (username == null || username.isBlank()) {
            return;
        }
        UserEntity contributedUser = userService.loadUserByUsername(username);
        if (contributedUser != null) {
            contributedUser.setContributionPoint(contributedUser.getContributionPoint() + 1);
            userService.save(contributedUser);
        }
    }
}

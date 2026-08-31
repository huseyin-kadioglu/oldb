package org.hk.flixly.controller;

import org.hk.flixly.model.MailRequest;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.service.MailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/send-email")
public class EmailController {

    private final MailService emailService;

    public EmailController(MailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> sendEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MailRequest request
    ) {
        if (!(userDetails instanceof UserEntity actor) || !UserRole.isAdmin(actor.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bu işlem için yetkiniz yok."));
        }
        emailService.sendSimpleEmail(request);
        return ResponseEntity.ok(Map.of("message", "E-posta başarıyla gönderildi."));
    }
}

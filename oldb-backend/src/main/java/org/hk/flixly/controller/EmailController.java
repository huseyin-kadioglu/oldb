package org.hk.flixly.controller;

import org.hk.flixly.model.MailRequest;
import org.hk.flixly.service.MailService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/send-email")
@Profile("local")
public class EmailController {

    private final MailService emailService;

    public EmailController(MailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public String sendEmail(@RequestBody MailRequest request) {
        emailService.sendSimpleEmail(request);
        return "E-posta başarıyla gönderildi.";
    }
}

package org.hk.flixly.controller;

import org.hk.flixly.model.MailRequest;
import org.hk.flixly.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/send-email")
public class EmailController {

    @Autowired
    private MailService emailService;

    @PostMapping
    public String sendEmail(@RequestBody MailRequest request) {
        emailService.sendSimpleEmail(request);
        return "E-posta başarıyla gönderildi.";
    }
}
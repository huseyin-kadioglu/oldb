package org.hk.flixly.service;

import org.hk.flixly.model.MailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendSimpleEmail(MailRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("huseyinavnikadioglu@gmail.com");
        message.setTo(request.getTo());
        message.setSubject(request.getSubject());
        message.setText(request.getBody());
        mailSender.send(message);
    }
}



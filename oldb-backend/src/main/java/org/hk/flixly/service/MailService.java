package org.hk.flixly.service;

import jakarta.mail.internet.MimeMessage;
import org.hk.flixly.model.MailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    // HTML MAIL
    public void sendHtmlEmail(MailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    "UTF-8"
            );

            helper.setFrom("OLDB <huseyinavnikadioglu@gmail.com>"); // ✔ marka kimliği
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getBody(), true); // ✔ HTML içerik

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace(); // ✔ en azından log’a düşsün
            throw new RuntimeException("HTML e-posta gönderilemedi", e);
        }
    }
}



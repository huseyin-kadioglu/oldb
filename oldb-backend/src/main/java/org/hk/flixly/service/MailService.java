package org.hk.flixly.service;

import jakarta.mail.internet.MimeMessage;
import org.hk.flixly.config.AppProperties;
import org.hk.flixly.model.MailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final AppProperties appProperties;
    private final MailRateLimiter rateLimiter;

    public MailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            AppProperties appProperties,
            MailRateLimiter rateLimiter
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.appProperties = appProperties;
        this.rateLimiter = rateLimiter;
    }

    public void sendSimpleEmail(MailRequest request) {
        JavaMailSender mailSender = requireMailSender();
        rateLimiter.checkAllowed(appProperties.getMail().getDailyCap());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(appProperties.getMail().getFrom());
        message.setTo(request.getTo());
        message.setSubject(request.getSubject());
        message.setText(request.getBody());
        mailSender.send(message);
        log.debug("Plain mail sent to {}", request.getTo());
    }

    public void sendHtmlEmail(MailRequest request) {
        JavaMailSender mailSender = requireMailSender();
        rateLimiter.checkAllowed(appProperties.getMail().getDailyCap());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    "UTF-8"
            );

            helper.setFrom(appProperties.getMail().getFrom());
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getBody(), true);

            mailSender.send(message);
            log.debug("HTML mail sent to {}", request.getTo());
        } catch (Exception e) {
            log.error("HTML e-posta gönderilemedi: {}", request.getTo(), e);
            throw new RuntimeException("HTML e-posta gönderilemedi", e);
        }
    }

    private JavaMailSender requireMailSender() {
        if (!appProperties.getMail().isEnabled()) {
            throw new MailNotConfiguredException(
                    "E-posta gönderimi bu ortamda devre dışı (app.mail.enabled=false)."
            );
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new MailNotConfiguredException(
                    "SMTP yapılandırılmamış. spring.mail.host ve kimlik bilgilerini kontrol edin."
            );
        }
        return mailSender;
    }
}

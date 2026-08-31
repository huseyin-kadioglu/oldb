package org.hk.flixly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class MailEnvironmentValidator {

    private static final Logger log = LoggerFactory.getLogger(MailEnvironmentValidator.class);

    private final Environment environment;
    private final AppProperties appProperties;

    public MailEnvironmentValidator(Environment environment, AppProperties appProperties) {
        this.environment = environment;
        this.appProperties = appProperties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        String host = environment.getProperty("spring.mail.host", "").trim();
        String from = appProperties.getMail().getFrom();

        if (host.isEmpty()) {
            throw new IllegalStateException(
                    "app.mail.enabled=true ancak spring.mail.host boş. MAIL_HOST ortam değişkenini ayarlayın."
            );
        }
        if (from == null || from.isBlank()) {
            throw new IllegalStateException("MAIL_FROM / app.mail.from zorunlu.");
        }

        log.info(
                "Mail hazır — smtp={}:{}, from={}, dailyCap={}",
                host,
                environment.getProperty("spring.mail.port", "587"),
                from,
                appProperties.getMail().getDailyCap()
        );
    }
}

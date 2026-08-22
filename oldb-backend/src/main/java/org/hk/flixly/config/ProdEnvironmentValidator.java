package org.hk.flixly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Prod ortamında zayıf varsayılanlar ve eksik secret'ları engeller.
 */
@Component
@Profile("prod")
public class ProdEnvironmentValidator {

    private static final Logger log = LoggerFactory.getLogger(ProdEnvironmentValidator.class);
    private static final Set<String> FORBIDDEN_PASSWORDS = Set.of("mypassword", "password", "postgres");
    private static final int MIN_JWT_SECRET_LENGTH = 32;

    private final Environment environment;

    public ProdEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        requireNonBlank("DATABASE_URL", environment.getProperty("spring.datasource.url"));
        requireNonBlank("DATABASE_USER", environment.getProperty("spring.datasource.username"));
        requireNonBlank("DATABASE_PASSWORD", environment.getProperty("spring.datasource.password"));
        requireNonBlank("JWT_SECRET_KEY", environment.getProperty("security.jwt.secret-key"));

        String password = environment.getProperty("spring.datasource.password", "");
        if (FORBIDDEN_PASSWORDS.contains(password.toLowerCase())) {
            throw new IllegalStateException(
                    "Prod veritabanı şifresi güvenli değil. DATABASE_PASSWORD için güçlü bir değer kullanın."
            );
        }

        String jwtSecret = environment.getProperty("security.jwt.secret-key", "");
        if (jwtSecret.length() < MIN_JWT_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET_KEY en az " + MIN_JWT_SECRET_LENGTH + " karakter olmalı."
            );
        }

        String ddlAuto = environment.getProperty("spring.jpa.hibernate.ddl-auto", "");
        if (!"validate".equalsIgnoreCase(ddlAuto)) {
            throw new IllegalStateException(
                    "Prod ortamında spring.jpa.hibernate.ddl-auto=validate zorunlu (şu an: " + ddlAuto + ")."
            );
        }

        String datasourceUrl = environment.getProperty("spring.datasource.url", "");
        if (!datasourceUrl.contains("oldb_prod")) {
            log.warn(
                    "Prod datasource URL 'oldb_prod' içermiyor. Yanlış veritabanına bağlanma riski: {}",
                    maskJdbcUrl(datasourceUrl)
            );
        }

        if (!datasourceUrl.contains("sslmode=")) {
            log.warn(
                    "Prod JDBC URL'de sslmode yok. Yönetilen Postgres için ?sslmode=require ekleyin."
            );
        }

        log.info("Prod güvenlik doğrulaması tamam — DB: {}", maskJdbcUrl(datasourceUrl));
    }

    private static void requireNonBlank(String name, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Prod ortamında " + name + " zorunlu ve boş olamaz.");
        }
    }

    private static String maskJdbcUrl(String url) {
        if (url == null || url.length() < 20) {
            return url;
        }
        return url.substring(0, url.indexOf('@') > 0 ? url.indexOf('@') : 30) + "...";
    }
}

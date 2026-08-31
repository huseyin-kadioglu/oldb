package org.hk.flixly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalEnvironmentValidator {

    private static final Logger log = LoggerFactory.getLogger(LocalEnvironmentValidator.class);

    private final Environment environment;

    public LocalEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        String datasourceUrl = environment.getProperty("spring.datasource.url", "");
        if (datasourceUrl.contains("oldb_prod") || datasourceUrl.contains("oldb_test")) {
            throw new IllegalStateException(
                    "Local profili oldb_test veya oldb_prod'a bağlanamaz: " + datasourceUrl
            );
        }
        if (!datasourceUrl.contains("oldb_local") && !datasourceUrl.contains("oldb_ci")) {
            log.warn("Local datasource oldb_local değil: {}", datasourceUrl);
        }
        String jwt = environment.getProperty("security.jwt.secret-key", "");
        if (jwt.isBlank()) {
            throw new IllegalStateException(
                    "Local ortamında JWT_SECRET_KEY / security.jwt.secret-key zorunlu. "
                            + "application-local.properties.example dosyasını kopyalayın."
            );
        }
        log.info("Local ortamı — DB={}", datasourceUrl);
    }
}

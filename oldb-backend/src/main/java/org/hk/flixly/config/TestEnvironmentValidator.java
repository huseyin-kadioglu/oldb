package org.hk.flixly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class TestEnvironmentValidator {

    private static final Logger log = LoggerFactory.getLogger(TestEnvironmentValidator.class);

    private final Environment environment;
    private final AppProperties appProperties;

    public TestEnvironmentValidator(Environment environment, AppProperties appProperties) {
        this.environment = environment;
        this.appProperties = appProperties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        String datasourceUrl = environment.getProperty("spring.datasource.url", "");
        if (datasourceUrl.contains("oldb_prod")) {
            throw new IllegalStateException("Test profili oldb_prod'a bağlanamaz.");
        }
        if (!datasourceUrl.contains("oldb_test")) {
            throw new IllegalStateException(
                    "Test profili yalnızca oldb_test veritabanına bağlanabilir: " + datasourceUrl
            );
        }
        log.info(
                "Test ortamı — backend={}, frontend={}",
                appProperties.getBackendUrl(),
                appProperties.getFrontendUrl()
        );
    }
}

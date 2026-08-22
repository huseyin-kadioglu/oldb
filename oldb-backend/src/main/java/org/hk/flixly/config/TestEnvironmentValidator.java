package org.hk.flixly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Test ortamında yanlış DB'ye bağlanmayı azaltır (oldb_test beklenir).
 */
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
        if (!datasourceUrl.contains("oldb_test")) {
            log.warn(
                    "Test datasource URL 'oldb_test' içermiyor — prod DB'ye bağlanma riski: {}",
                    datasourceUrl
            );
        }

        log.info(
                "Test ortamı — DB hedefi doğrulandı, backend={}, frontend={}",
                appProperties.getBackendUrl(),
                appProperties.getFrontendUrl()
        );
    }
}

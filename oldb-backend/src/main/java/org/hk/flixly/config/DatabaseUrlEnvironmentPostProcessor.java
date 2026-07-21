package org.hk.flixly.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Prefer Railway/Heroku {@code DATABASE_URL=postgresql://user:pass@host:port/db}
 * over local jdbc defaults when the env var is present.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getenv("DATABASE_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL"),
                environment.getProperty("DATABASE_URL")
        );
        if (raw == null || raw.isBlank()) {
            return;
        }

        Map<String, Object> map = new HashMap<>();
        if (raw.startsWith("jdbc:")) {
            map.put("spring.datasource.url", raw);
            putEnv(map, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME");
            putEnv(map, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD");
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlJdbc", map));
            return;
        }

        try {
            URI uri = new URI(raw);
            String scheme = uri.getScheme();
            if (scheme == null) {
                return;
            }
            if (!scheme.equals("postgres") && !scheme.equals("postgresql")) {
                return;
            }
            String userInfo = uri.getUserInfo();
            if (userInfo == null || !userInfo.contains(":")) {
                return;
            }
            int colon = userInfo.indexOf(':');
            String user = decode(userInfo.substring(0, colon));
            String pass = decode(userInfo.substring(colon + 1));
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            if (path == null || path.length() < 2) {
                return;
            }
            String db = path.startsWith("/") ? path.substring(1) : path;
            String query = uri.getQuery();
            String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + db
                    + (query != null && !query.isBlank() ? "?" + query : "");

            map.put("spring.datasource.url", jdbc);
            map.put("spring.datasource.username", user);
            map.put("spring.datasource.password", pass);
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlParsed", map));
        } catch (URISyntaxException ignored) {
            // leave application defaults
        }
    }

    private static void putEnv(Map<String, Object> map, String key, String envName) {
        String value = System.getenv(envName);
        if (value != null && !value.isBlank()) {
            map.put(key, value);
        }
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    private static String decode(String raw) {
        return URLDecoder.decode(raw, StandardCharsets.UTF_8);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}

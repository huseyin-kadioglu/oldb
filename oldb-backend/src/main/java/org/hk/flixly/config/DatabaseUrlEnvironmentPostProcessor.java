package org.hk.flixly.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Maps Railway/Heroku style DB env vars onto {@code spring.datasource.*}.
 * Supports {@code DATABASE_URL}, {@code SPRING_DATASOURCE_URL}, and discrete {@code PG*} vars.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(jdbc:)?postgres(?:ql)?://([^:@/]+)(?::([^@/]*))?@([^:/]+)(?::(\\d+))?/([^?]+)(?:\\?(.*))?$",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> map = new HashMap<>();

        String raw = firstNonBlank(
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("DATABASE_PRIVATE_URL"),
                System.getenv("POSTGRES_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL"),
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("DATABASE_PRIVATE_URL")
        );

        if (raw != null && !raw.isBlank()) {
            if (raw.startsWith("jdbc:postgresql://") || raw.startsWith("jdbc:postgres://")) {
                map.put("spring.datasource.url", ensureSsl(raw.replace("jdbc:postgres://", "jdbc:postgresql://")));
                putEnv(map, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME", "PGUSER", "POSTGRES_USER");
                putEnv(map, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD", "PGPASSWORD", "POSTGRES_PASSWORD");
            } else {
                Matcher m = URL_PATTERN.matcher(raw.trim());
                if (m.matches()) {
                    String user = decode(m.group(2));
                    String pass = m.group(3) != null ? decode(m.group(3)) : "";
                    String host = m.group(4);
                    String port = m.group(5) != null ? m.group(5) : "5432";
                    String db = m.group(6);
                    String query = m.group(7);
                    String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + db;
                    if (query != null && !query.isBlank()) {
                        jdbc = jdbc + "?" + query;
                    }
                    jdbc = ensureSsl(jdbc);
                    map.put("spring.datasource.url", jdbc);
                    map.put("spring.datasource.username", user);
                    map.put("spring.datasource.password", pass);
                }
            }
        }

        if (!map.containsKey("spring.datasource.url")) {
            String host = firstNonBlank(System.getenv("PGHOST"), System.getenv("POSTGRES_HOST"));
            String db = firstNonBlank(System.getenv("PGDATABASE"), System.getenv("POSTGRES_DB"));
            String user = firstNonBlank(System.getenv("PGUSER"), System.getenv("POSTGRES_USER"));
            String pass = firstNonBlank(System.getenv("PGPASSWORD"), System.getenv("POSTGRES_PASSWORD"));
            String port = firstNonBlank(System.getenv("PGPORT"), System.getenv("POSTGRES_PORT"), "5432");
            if (host != null && db != null && user != null && pass != null) {
                String jdbc = ensureSsl("jdbc:postgresql://" + host + ":" + port + "/" + db);
                map.put("spring.datasource.url", jdbc);
                map.put("spring.datasource.username", user);
                map.put("spring.datasource.password", pass);
            }
        }

        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlParsed", map));
        }
    }

    /** Railway public Postgres typically requires SSL. */
    private static String ensureSsl(String jdbc) {
        if (jdbc.contains("localhost") || jdbc.contains("127.0.0.1")) {
            return jdbc;
        }
        if (jdbc.contains("sslmode=")) {
            return jdbc;
        }
        return jdbc + (jdbc.contains("?") ? "&" : "?") + "sslmode=require";
    }

    private static void putEnv(Map<String, Object> map, String key, String... envNames) {
        for (String name : envNames) {
            String v = System.getenv(name);
            if (v != null && !v.isBlank()) {
                map.put(key, v);
                return;
            }
        }
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
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

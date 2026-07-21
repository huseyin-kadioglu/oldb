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
        boolean hasDatabaseUrl = notBlank(System.getenv("DATABASE_URL"));
        boolean hasSpringUrl = notBlank(System.getenv("SPRING_DATASOURCE_URL"));
        boolean hasPgHost = notBlank(System.getenv("PGHOST"));
        // Visible in Railway deploy logs — no secrets
        System.out.println("[oldb-db] DATABASE_URL set=" + hasDatabaseUrl
                + " SPRING_DATASOURCE_URL set=" + hasSpringUrl
                + " PGHOST set=" + hasPgHost);

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
            raw = raw.trim();
            if (raw.startsWith("jdbc:postgresql://") || raw.startsWith("jdbc:postgres://")) {
                String jdbc = raw.replace("jdbc:postgres://", "jdbc:postgresql://");
                map.put("spring.datasource.url", jdbc);
                putEnv(map, "spring.datasource.username", "SPRING_DATASOURCE_USERNAME", "PGUSER", "POSTGRES_USER");
                putEnv(map, "spring.datasource.password", "SPRING_DATASOURCE_PASSWORD", "PGPASSWORD", "POSTGRES_PASSWORD");
            } else {
                Matcher m = URL_PATTERN.matcher(raw);
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
                    map.put("spring.datasource.url", jdbc);
                    map.put("spring.datasource.username", user);
                    map.put("spring.datasource.password", pass);
                    System.out.println("[oldb-db] parsed host=" + host + " db=" + db + " user=" + user);
                } else {
                    System.out.println("[oldb-db] DATABASE_URL present but did not match expected postgres URL pattern");
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
                String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + db;
                map.put("spring.datasource.url", jdbc);
                map.put("spring.datasource.username", user);
                map.put("spring.datasource.password", pass);
                System.out.println("[oldb-db] using PG* host=" + host + " db=" + db);
            }
        }

        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlParsed", map));
        } else {
            System.out.println("[oldb-db] WARNING: no cloud DB env detected; Spring may fall back to localhost");
        }
    }

    private static boolean notBlank(String v) {
        return v != null && !v.isBlank();
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

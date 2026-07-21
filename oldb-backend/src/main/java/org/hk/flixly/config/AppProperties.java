package org.hk.flixly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /** Public API base, e.g. http://localhost:8080 or https://api.example.com */
    private String backendUrl = "http://localhost:8080";

    /** Public SPA base, e.g. http://localhost:3000 or https://oldb.example.com */
    private String frontendUrl = "http://localhost:3000";

    /** Comma-separated CORS origins */
    private String corsOrigins = "http://localhost:3000";

    private final Mail mail = new Mail();

    public String getBackendUrl() {
        return trimTrailingSlash(backendUrl);
    }

    public void setBackendUrl(String backendUrl) {
        this.backendUrl = backendUrl;
    }

    public String getFrontendUrl() {
        return trimTrailingSlash(frontendUrl);
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public String getCorsOrigins() {
        return corsOrigins;
    }

    public void setCorsOrigins(String corsOrigins) {
        this.corsOrigins = corsOrigins;
    }

    public Mail getMail() {
        return mail;
    }

    public List<String> corsOriginList() {
        if (corsOrigins == null || corsOrigins.isBlank()) {
            return List.of(getFrontendUrl());
        }
        return Arrays.stream(corsOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public String activationUrl(String encodedToken) {
        return getBackendUrl() + "/api/auth/activate?token=" + encodedToken;
    }

    public String loginUrl() {
        return getFrontendUrl() + "/signin";
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public static class Mail {
        /** From header, e.g. OLDB <noreply@example.com> */
        private String from = "OLDB <noreply@localhost>";

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }
    }
}

package org.hk.flixly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String backendUrl = "http://localhost:8080";
    private String frontendUrl = "http://localhost:3000";
    private Cors cors = new Cors();
    private Mail mail = new Mail();

    public String getBackendUrl() {
        return backendUrl;
    }

    public void setBackendUrl(String backendUrl) {
        this.backendUrl = backendUrl;
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Mail getMail() {
        return mail;
    }

    public void setMail(Mail mail) {
        this.mail = mail;
    }

    public List<String> getCorsAllowedOriginsList() {
        String raw = cors != null && cors.getAllowedOrigins() != null
                ? cors.getAllowedOrigins()
                : "http://localhost:3000";
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public String activationUrl(String encodedToken) {
        return trimTrailingSlash(backendUrl) + "/api/auth/activate?token=" + encodedToken;
    }

    public String loginUrl() {
        return trimTrailingSlash(frontendUrl) + "/login";
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isEmpty()) {
            return "";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Mail {
        private boolean enabled = false;
        private String from = "OLDB <noreply@localhost>";
        private int dailyCap = 0;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }

        public int getDailyCap() {
            return dailyCap;
        }

        public void setDailyCap(int dailyCap) {
            this.dailyCap = dailyCap;
        }
    }
}

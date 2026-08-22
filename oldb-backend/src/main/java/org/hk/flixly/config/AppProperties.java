package org.hk.flixly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String backendUrl = "http://localhost:8080";
    private String frontendUrl = "http://localhost:3000";
    private String corsAllowedOrigins = "http://localhost:3000";
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

    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }

    public void setCorsAllowedOrigins(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    public Mail getMail() {
        return mail;
    }

    public void setMail(Mail mail) {
        this.mail = mail;
    }

    public List<String> getCorsAllowedOriginsList() {
        return Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Aktivasyon linki backend API üzerinden açılır; ortam URL'si app.backend.url'den gelir. */
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

    public static class Mail {
        private boolean enabled = false;
        private String from = "OLDB <noreply@localhost>";
        /** 0 = sınırsız */
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

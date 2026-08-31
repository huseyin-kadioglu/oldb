package org.hk.flixly.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Günlük mail gönderim limiti (prod/test). Sınır 0 ise limitsiz.
 */
@Service
public class MailRateLimiter {

    private final AtomicInteger count = new AtomicInteger(0);
    private volatile LocalDate day = LocalDate.now();

    public void checkAllowed(int dailyCap) {
        if (dailyCap <= 0) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (!today.equals(day)) {
            day = today;
            count.set(0);
        }
        if (count.incrementAndGet() > dailyCap) {
            throw new MailRateLimitException(
                    "Günlük e-posta gönderim limitine ulaşıldı. Lütfen daha sonra tekrar deneyin."
            );
        }
    }

    public static class MailRateLimitException extends RuntimeException {
        public MailRateLimitException(String message) {
            super(message);
        }
    }
}

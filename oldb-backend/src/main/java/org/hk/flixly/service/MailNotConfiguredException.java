package org.hk.flixly.service;

import org.springframework.stereotype.Service;

@Service
public class MailNotConfiguredException extends RuntimeException {
    public MailNotConfiguredException(String message) {
        super(message);
    }
}

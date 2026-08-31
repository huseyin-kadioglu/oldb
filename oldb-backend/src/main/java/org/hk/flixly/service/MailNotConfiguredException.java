package org.hk.flixly.service;

public class MailNotConfiguredException extends RuntimeException {
    public MailNotConfiguredException(String message) {
        super(message);
    }
}

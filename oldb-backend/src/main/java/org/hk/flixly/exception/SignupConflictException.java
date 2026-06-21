package org.hk.flixly.exception;

import lombok.Getter;

@Getter
public class SignupConflictException extends RuntimeException {
    private final String code;

    public SignupConflictException(String code, String message) {
        super(message);
        this.code = code;
    }
}

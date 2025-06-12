package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    @Getter
    private String token;
    private String username;
    private long expiresIn;
    private String profileName;
    private String role;
}
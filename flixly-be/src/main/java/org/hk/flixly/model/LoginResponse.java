package org.hk.flixly.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String username;
    private long expiresIn;
    private String profileName;
    private String role;
}
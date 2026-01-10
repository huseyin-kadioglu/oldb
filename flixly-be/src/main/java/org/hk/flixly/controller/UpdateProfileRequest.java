package org.hk.flixly.controller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String username;
    private String location;
    private String bio;
}

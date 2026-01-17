package org.hk.flixly.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;

    // getter / setter
}
package org.hk.flixly.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    private String message;
    private SignupStatus status;

    public enum SignupStatus {
        CREATED,
        ACTIVATION_RESENT
    }

    public static SignupResponse created() {
        return new SignupResponse(
                "Hesabınız oluşturuldu. Lütfen e-posta kutunuzu kontrol ederek hesabınızı aktifleştirin.",
                SignupStatus.CREATED
        );
    }

    public static SignupResponse activationResent() {
        return new SignupResponse(
                "Bu e-posta ile daha önce kayıt yapılmış ancak hesap henüz aktifleştirilmemiş. Aktivasyon maili tekrar gönderildi.",
                SignupStatus.ACTIVATION_RESENT
        );
    }
}

package org.hk.flixly.controller;

import org.hk.flixly.model.LoginResponse;
import org.hk.flixly.model.LoginUserDto;
import org.hk.flixly.model.RegisterUserDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.service.AuthenticationService;
import org.hk.flixly.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;

    private final AuthenticationService authenticationService;

    private static final String url =  "https://localhost:8080";

    public AuthController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterUserDto registerUserDto) {
        UserEntity registeredUser = authenticationService.signup(registerUserDto);

        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping("/activate")
    public ResponseEntity<String> activateUser(@RequestParam String token) {
        boolean isActivated = authenticationService.activateUser(token);
        if (isActivated) {
            return ResponseEntity.ok(
                    "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'>" +
                            "<h2>🎉 Hesabınız başarıyla aktifleştirildi!</h2>" +
                            "<p>Artık giriş yapabilirsiniz.</p>" +
                            "<a href='https://localhost:8080/login'>Giriş Yap</a>" +
                            "</body></html>"
            );
        } else {
            return ResponseEntity.badRequest().body(
                    "<html><body style='font-family:sans-serif;text-align:center;padding:50px;color:red;'>" +
                            "<h2>❌ Aktivasyon başarısız</h2>" +
                            "<p>Geçersiz veya süresi dolmuş bir aktivasyon linki.</p>" +
                            "</body></html>"
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        UserEntity authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setUsername(authenticatedUser.getUsername());
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setProfileName(authenticatedUser.getProfilName());
        loginResponse.setRole(authenticatedUser.getRole());

        return ResponseEntity.ok(loginResponse);
    }
}
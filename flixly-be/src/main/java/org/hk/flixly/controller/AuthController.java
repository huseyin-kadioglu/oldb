package org.hk.flixly.controller;

import org.hk.flixly.model.LoginResponse;
import org.hk.flixly.model.LoginUserDto;
import org.hk.flixly.model.RegisterUserDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.service.AuthenticationService;
import org.hk.flixly.service.JwtService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Base URL config üzerinden de gelebilir
    private static final String FRONTEND_URL = "http://localhost:5173";
    private static final String LOGIN_URL = FRONTEND_URL + "/login";
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthController(
            JwtService jwtService,
            AuthenticationService authenticationService
    ) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterUserDto dto) {
        UserEntity registeredUser = authenticationService.signup(dto);
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping(value = "/activate", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> activateUser(@RequestParam String token) {
        boolean activated = authenticationService.activateUser(token);

        if (activated) {
            return ResponseEntity.ok(successHtml());
        } else {
            return ResponseEntity.badRequest().body(errorHtml());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto dto) {
        UserEntity user = authenticationService.authenticate(dto);
        String jwtToken = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse(
                user.getUsername(),
                jwtToken,
                jwtService.getExpirationTime(),
                user.getProfilName(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    private String successHtml() {
        return new StringBuilder()
                .append("<html><head>")
                .append("<meta charset='UTF-8'/>")
                .append("<title>Hesap Aktifleştirildi</title>")
                .append("<style>")
                // Genel stiller
                .append("body { margin:0; font-family: Graphik-Light-Web, sans-serif; ")
                .append("background-color:#1e242b; color:#ffffff; ")
                .append("display:flex; justify-content:center; align-items:center; height:100vh; }")
                // Kart
                .append(".card { background:#2a2f38; padding:40px; border-radius:16px; ")
                .append("width:420px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.4); }")
                // Başlık
                .append("h2 { color:#fbc401; font-weight:400; margin-bottom:20px; }")
                // Açıklama
                .append("p { color:#aaa; font-size:1.1rem; margin-bottom:28px; }")
                // Buton
                .append("a { display:inline-block; background:#fbc401; color:#000; ")
                .append("padding:12px 20px; border-radius:8px; text-decoration:none; font-size:1rem; }")
                .append("a:hover { background:#e0a800; }")
                .append("</style>")
                .append("</head><body>")
                .append("<div class='card'>")
                .append("<h2>🎉 Hesabınız Aktifleştirildi</h2>")
                .append("<p>Artık giriş yapabilirsiniz.</p>")
                .append("<a href='").append(LOGIN_URL).append("'>Giriş Yap</a>")
                .append("</div>")
                .append("</body></html>")
                .toString();
    }

    private String errorHtml() {
        return new StringBuilder()
                .append("<html><head>")
                .append("<meta charset='UTF-8'/>")
                .append("<title>Aktivasyon Hatası</title>")
                .append("<style>")
                .append("body { margin:0; font-family: Graphik-Light-Web, sans-serif; ")
                .append("background-color:#1e242b; color:#ffffff; ")
                .append("display:flex; justify-content:center; align-items:center; height:100vh; }")

                .append(".card { background:#2a2f38; padding:40px; border-radius:16px; ")
                .append("width:420px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.4); }")

                .append("h2 { color:#ff5c5c; font-weight:400; margin-bottom:20px; }")

                .append("p { color:#aaa; font-size:1.1rem; margin-bottom:10px; }")

                .append("</style>")
                .append("</head><body>")
                .append("<div class='card'>")
                .append("<h2>❌ Aktivasyon Başarısız</h2>")
                .append("<p>Geçersiz veya süresi dolmuş bir aktivasyon linki.</p>")
                .append("</div>")
                .append("</body></html>")
                .toString();
    }

}

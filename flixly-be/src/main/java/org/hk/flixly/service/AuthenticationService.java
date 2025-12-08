package org.hk.flixly.service;

import org.hk.flixly.model.LoginUserDto;
import org.hk.flixly.model.MailRequest;
import org.hk.flixly.model.RegisterUserDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final MailService mailService;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            BCryptPasswordEncoder passwordEncoder, MailService mailService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    public UserEntity signup(RegisterUserDto dto) {
        // Email veya username kontrolü
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Bu e-posta zaten kayıtlı");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Bu kullanıcı adı zaten kayıtlı");
        }

        UserEntity user = new UserEntity();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setStatus(false);
        user.setActivationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);

        // URL encode
        String encodedToken = URLEncoder.encode(user.getActivationToken(), StandardCharsets.UTF_8);
        String activationLink = "http://localhost:8080/api/auth/activate?token=" + encodedToken;

        // HTML mail body
        String mailBody = buildActivationEmail(user.getFullName(), activationLink);

        MailRequest emailRequest = new MailRequest();
        emailRequest.setTo(user.getEmail());
        emailRequest.setSubject("Hesap Aktivasyonu");
        emailRequest.setBody(mailBody);

        mailService.sendHtmlEmail(emailRequest);

        return user;
    }

    private String buildActivationEmail(String fullName, String link) {

        // XSS veya HTML bozulmasını engelle
        String safeName = fullName.replace("<", "&lt;").replace(">", "&gt;");

        return new StringBuilder()
                .append("<div style='font-family:Graphik-Light-Web, sans-serif; ")
                .append("background-color:#1e242b; padding:40px; color:#ffffff;'>")

                .append("<div style='background:#2a2f38; padding:30px; border-radius:12px; max-width:600px; margin:auto;'>")

                .append("<h2 style='color:#fbc401; font-weight:400;'>Merhaba ")
                .append(safeName)
                .append(",</h2>")

                .append("<p style='color:#aaa; font-size:1.1rem;'>")
                .append("Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:")
                .append("</p>")

                .append("<div style='text-align:center; margin:30px 0;'>")
                .append("<a href='")
                .append(link)
                .append("' style='background:#fbc401; color:#000; padding:12px 20px; text-decoration:none; ")
                .append("border-radius:8px; font-size:1rem;'>Hesabı Aktifleştir</a>")
                .append("</div>")

                .append("<p style='color:#aaa;'>Bu link 24 saat geçerlidir. Eğer süresi dolarsa yeni aktivasyon talebi oluşturabilirsiniz.</p>")
                .append("<p style='color:#aaa;'>Herhangi bir sorun yaşarsanız bizimle iletişime geçebilirsiniz.</p>")

                .append("<p style='margin-top:30px; color:#888;'>Saygılarımızla,<br/>OLDB Ekibi</p>")

                .append("</div>")
                .append("</div>")
                .toString();
    }

    public boolean activateUser(String token) {
        Optional<UserEntity> optionalUser = userRepository.findByActivationToken(token);
        if (optionalUser.isPresent()) {
            UserEntity user = optionalUser.get();
            if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
                return false; // Süresi dolmuş token
            }
            user.setStatus(true);
            user.setActivationToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public UserEntity authenticate(LoginUserDto input) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));

        return userRepository.findByEmailAndStatus(input.getEmail(), true).orElseThrow();
    }
}
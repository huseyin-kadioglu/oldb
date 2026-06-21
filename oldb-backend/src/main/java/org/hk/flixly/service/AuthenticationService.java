package org.hk.flixly.service;

import org.hk.flixly.exception.SignupConflictException;
import org.hk.flixly.model.LoginUserDto;
import org.hk.flixly.model.MailRequest;
import org.hk.flixly.model.RegisterUserDto;
import org.hk.flixly.model.SignupResponse;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

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

    public SignupResponse signup(RegisterUserDto dto) {
        Optional<UserEntity> existingByEmail = userRepository.findByEmail(dto.getEmail());
        if (existingByEmail.isPresent()) {
            UserEntity existing = existingByEmail.get();
            if (existing.isStatus()) {
                throw new SignupConflictException(
                        "EMAIL_ALREADY_ACTIVE",
                        "Bu e-posta zaten kayıtlı. Giriş yapabilirsiniz."
                );
            }
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
                existing.setFullName(dto.getFullName());
            }
            sendActivationEmail(existing);
            return SignupResponse.activationResent();
        }

        Optional<UserEntity> existingByUsername = userRepository.findByUsername(dto.getUsername());
        if (existingByUsername.isPresent()) {
            UserEntity existing = existingByUsername.get();
            if (existing.isStatus()) {
                throw new SignupConflictException(
                        "USERNAME_TAKEN",
                        "Bu kullanıcı adı zaten kullanılıyor."
                );
            }
            throw new SignupConflictException(
                    "USERNAME_TAKEN",
                    "Bu kullanıcı adı zaten kullanılıyor."
            );
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
        sendActivationEmail(user);

        return SignupResponse.created();
    }

    private void sendActivationEmail(UserEntity user) {
        user.setActivationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String encodedToken = URLEncoder.encode(user.getActivationToken(), StandardCharsets.UTF_8);
        String activationLink = "http://localhost:8080/api/auth/activate?token=" + encodedToken;
        String mailBody = buildActivationEmail(user.getFullName(), activationLink);

        MailRequest emailRequest = new MailRequest();
        emailRequest.setTo(user.getEmail());
        emailRequest.setSubject("Hesap Aktivasyonu");
        emailRequest.setBody(mailBody);

        try {
            mailService.sendHtmlEmail(emailRequest);
        } catch (RuntimeException ex) {
            log.warn("Aktivasyon maili gönderilemedi: {}", user.getEmail(), ex);
            throw new IllegalArgumentException(
                    "Hesap kaydedildi ancak aktivasyon maili gönderilemedi. Lütfen daha sonra tekrar deneyin."
            );
        }
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
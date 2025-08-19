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
        user.setStatus(false); // Aktif değil
        user.setActivationToken(UUID.randomUUID().toString());
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));
        // Diğer alanlar...

        userRepository.save(user);

        String activationLink = "http://localhost:8080/api/auth/activate?token=" + user.getActivationToken();

        String mailBody = "Merhaba " + user.getFullName() + ",\n\n" +
                "Hesabınızı aktifleştirmek için lütfen aşağıdaki linke tıklayın:\n" +
                activationLink + "\n\n" +
                "Bu link 24 saat boyunca geçerlidir.\n" +
                "Eğer link süresi dolarsa, lütfen yeni aktivasyon talebi oluşturun.\n\n" +
                "Bizi tercih ettiğiniz için teşekkür ederiz.\n" +
                "Herhangi bir sorun yaşarsanız, destek ekibimizle iletişime geçebilirsiniz.\n\n" +
                "Saygılarımızla,\n" +
                "OLDB ekibi";

        MailRequest emailRequest = new MailRequest();
        emailRequest.setTo(user.getEmail());
        emailRequest.setSubject("Hesap Aktivasyonu");
        emailRequest.setBody(mailBody);

        mailService.sendSimpleEmail(emailRequest);

        return user;
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
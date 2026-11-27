package org.hk.flixly.config;

import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Ensures the founder account exists for local/mobile testing and keeps it ADMIN.
 * Mobile and web share this same PostgreSQL users table via the Spring Boot API.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final String FOUNDER_EMAIL = "huseyinavnikadioglu@gmail.com";
    private static final String FOUNDER_USERNAME = "huseyin";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final boolean seedFounder;
    private final boolean resetFounderPassword;
    private final String founderPassword;

    public AdminBootstrap(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            @Value("${app.dev.seed-founder:true}") boolean seedFounder,
            @Value("${app.dev.reset-founder-password:true}") boolean resetFounderPassword,
            @Value("${app.dev.founder-password:test}") String founderPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedFounder = seedFounder;
        this.resetFounderPassword = resetFounderPassword;
        this.founderPassword = founderPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(FOUNDER_EMAIL).ifPresentOrElse(this::ensureExistingFounder, this::createFounderIfEnabled);
    }

    private void ensureExistingFounder(UserEntity user) {
        boolean changed = false;
        if (!UserRole.isAdmin(user.getRole())) {
            user.setRole(UserRole.ADMIN.name());
            changed = true;
            log.info("Founder account elevated to ADMIN: {}", FOUNDER_EMAIL);
        }
        if (!user.isStatus()) {
            user.setStatus(true);
            user.setActivationToken(null);
            user.setTokenExpiry(null);
            changed = true;
            log.info("Founder account activated: {}", FOUNDER_EMAIL);
        }
        if (resetFounderPassword) {
            user.setPassword(passwordEncoder.encode(founderPassword));
            changed = true;
            log.warn("Founder password reset from app.dev.founder-password (local/dev only)");
        }
        if (changed) {
            userRepository.save(user);
        }
    }

    private void createFounderIfEnabled() {
        if (!seedFounder) {
            log.warn("Founder account not found and seeding disabled: {}", FOUNDER_EMAIL);
            return;
        }
        UserEntity user = new UserEntity();
        user.setEmail(FOUNDER_EMAIL);
        user.setUsername(FOUNDER_USERNAME);
        user.setFullName("Huseyin Avni Kadioglu");
        user.setRole(UserRole.ADMIN.name());
        user.setStatus(true);
        user.setPassword(passwordEncoder.encode(founderPassword));
        user.setContributionPoint(0);
        user.setYearlyBookGoal(52);
        userRepository.save(user);
        log.info("Seeded founder account for local/mobile login: {} / (app.dev.founder-password)", FOUNDER_EMAIL);
    }
}

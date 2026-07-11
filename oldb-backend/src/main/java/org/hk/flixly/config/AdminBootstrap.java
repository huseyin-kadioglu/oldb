package org.hk.flixly.config;

import org.hk.flixly.model.enums.UserRole;
import org.hk.flixly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Kurucu hesabını her açılışta ADMIN rolüne yükseltir.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final String FOUNDER_EMAIL = "huseyinavnikadioglu@gmail.com";

    private final UserRepository userRepository;

    public AdminBootstrap(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        userRepository.findByEmail(FOUNDER_EMAIL).ifPresentOrElse(user -> {
            if (!UserRole.isAdmin(user.getRole())) {
                user.setRole(UserRole.ADMIN.name());
                userRepository.save(user);
                log.info("Founder account elevated to ADMIN: {}", FOUNDER_EMAIL);
            }
        }, () -> log.warn("Founder account not found yet: {}", FOUNDER_EMAIL));
    }
}

package org.hk.flixly.config;

import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import java.util.Locale;

/**
 * Creates one already-activated account when the API is pointed at a local
 * database, so Expo Go can sign in without the email activation link.
 * Remote databases are left untouched.
 */
@Component
public class LocalDemoUserBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDemoUserBootstrap.class);

    static final String DEMO_EMAIL = "demo@oldb.local";
    static final String DEMO_PASSWORD = "OldbDemo1";
    static final String DEMO_USERNAME = "demo";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final String datasourceUrl;
    private final int serverPort;

    public LocalDemoUserBootstrap(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            @Value("${spring.datasource.url:}") String datasourceUrl,
            @Value("${server.port:8080}") int serverPort
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.datasourceUrl = datasourceUrl;
        this.serverPort = serverPort;
    }

    static boolean isLocalDatasource(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        int scheme = lower.indexOf("://");
        if (scheme < 0) {
            return false;
        }
        String host = lower.substring(scheme + 3);
        int slash = host.indexOf('/');
        if (slash >= 0) {
            host = host.substring(0, slash);
        }
        int at = host.lastIndexOf('@');
        if (at >= 0) {
            host = host.substring(at + 1);
        }
        if (host.startsWith("[") && host.contains("]")) {
            host = host.substring(1, host.indexOf(']'));
        } else {
            int colon = host.indexOf(':');
            if (colon >= 0) {
                host = host.substring(0, colon);
            }
        }
        return host.equals("localhost") || host.equals("127.0.0.1") || host.equals("::1");
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isLocalDatasource(datasourceUrl)) {
            return;
        }
        ensureDemoUser();
        logPhoneUrls();
    }

    private void ensureDemoUser() {
        UserEntity existing = userRepository.findByEmail(DEMO_EMAIL).orElse(null);
        if (existing != null) {
            if (!existing.isStatus()) {
                existing.setStatus(true);
                existing.setActivationToken(null);
                existing.setTokenExpiry(null);
                userRepository.save(existing);
            }
            log.info("Local demo account is ready: {} / {}", DEMO_EMAIL, DEMO_PASSWORD);
            return;
        }

        if (userRepository.findByUsername(DEMO_USERNAME).isPresent()) {
            log.warn("Skipping local demo account because username {} is already taken", DEMO_USERNAME);
            return;
        }

        UserEntity user = new UserEntity();
        user.setUsername(DEMO_USERNAME);
        user.setEmail(DEMO_EMAIL);
        user.setFullName("Demo Okur");
        user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        user.setRole("USER");
        user.setStatus(true);
        user.setYearlyBookGoal(12);
        userRepository.save(user);
        log.info("Created local demo account: {} / {}", DEMO_EMAIL, DEMO_PASSWORD);
    }

    private void logPhoneUrls() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces == null) {
                return;
            }
            while (interfaces.hasMoreElements()) {
                NetworkInterface nif = interfaces.nextElement();
                if (!nif.isUp() || nif.isLoopback()) {
                    continue;
                }
                Enumeration<InetAddress> addresses = nif.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (!(address instanceof Inet4Address inet4) || inet4.isLoopbackAddress()) {
                        continue;
                    }
                    String host = inet4.getHostAddress();
                    if (host.startsWith("169.254.")) {
                        continue;
                    }
                    log.info("Expo Go API URL: http://{}:{}", host, serverPort);
                }
            }
        } catch (SocketException ex) {
            log.warn("Could not list LAN addresses for Expo Go", ex);
        }
    }
}

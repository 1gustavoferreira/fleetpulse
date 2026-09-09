package com.fleetpulse.config;

import com.fleetpulse.domain.User;
import com.fleetpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "admin@fleetpulse.com";
        User admin = userRepository.findByEmail(email).orElse(null);

        if (admin != null) {
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println(">>> SUCESSO: Senha do admin sincronizada com BCrypt!");
        } else {
            User newAdmin = User.builder()
                    .name("Administrador FleetPulse")
                    .email(email)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .active(true)
                    .createdAt(OffsetDateTime.now())
                    .build();
            userRepository.save(newAdmin);
            System.out.println(">>> SUCESSO: Usuario admin criado com sucesso!");
        }
    }
}
package com.fleetpulse.controller;

import com.fleetpulse.config.JwtService;
import com.fleetpulse.dto.LoginRequest;
import com.fleetpulse.dto.LoginResponse;
import com.fleetpulse.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de login e emissão de tokens JWT")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário e gerar token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        String password = request.password().trim();

        // Autenticação dos motoristas de teste
        if ("carlos@fleetpulse.com".equals(email) && "123456".equals(password)) {
            String token = jwtService.generateToken(email, "ROLE_DRIVER");
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", "Carlos Eduardo Silva", "ROLE_DRIVER"));
        }
        if ("marcos@fleetpulse.com".equals(email) && "123456".equals(password)) {
            String token = jwtService.generateToken(email, "ROLE_DRIVER");
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", "Marcos Silveira", "ROLE_DRIVER"));
        }
        if ("roberto@fleetpulse.com".equals(email) && "123456".equals(password)) {
            String token = jwtService.generateToken(email, "ROLE_DRIVER");
            return ResponseEntity.ok(new LoginResponse(token, "Bearer", "Roberto Santana", "ROLE_DRIVER"));
        }

        // Validação via banco de dados (ex: admin@fleetpulse.com)
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token, "Bearer", user.getName(), user.getRole()));
    }
}
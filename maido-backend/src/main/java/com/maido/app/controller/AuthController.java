package com.maido.app.controller;

import com.maido.app.dto.LoginRequest;
import com.maido.app.dto.LoginResponse;
import com.maido.app.dto.RegisterRequest;
import com.maido.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        if (response.isAutenticado()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        if (response.isAutenticado()) {
            return ResponseEntity.status(201).body(response);
        }
        return ResponseEntity.status(400).body(response);
    }
}

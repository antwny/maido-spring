package com.maido.app.service;

import com.maido.app.dto.LoginRequest;
import com.maido.app.dto.LoginResponse;
import com.maido.app.dto.RegisterRequest;
import com.maido.app.entity.Usuario;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
}

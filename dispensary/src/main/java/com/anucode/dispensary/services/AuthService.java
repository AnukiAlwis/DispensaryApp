package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.AuthResponse;
import com.anucode.dispensary.dtos.LoginRequest;
import com.anucode.dispensary.dtos.RefreshRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String refreshToken);
}

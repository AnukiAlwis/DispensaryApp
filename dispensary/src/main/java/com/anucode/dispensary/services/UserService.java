package com.anucode.dispensary.services;

import com.anucode.dispensary.dtos.UserRequestDto;
import com.anucode.dispensary.dtos.UserResponseDto;
import com.anucode.dispensary.entities.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponseDto createUser(UUID tenantId, UserRequestDto requestDto);

    UserResponseDto getUserById(UUID tenantId, UUID userId);

    UserResponseDto updateUser(UUID tenantId, UUID userId, UserRequestDto requestDto);

    List<UserResponseDto> getAllUsers(UUID tenantId, List<User.Role> roles);
}


package com.anucode.dispensary.services.serviceImpl;


import com.anucode.dispensary.dtos.UserRequestDto;
import com.anucode.dispensary.dtos.UserResponseDto;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.exception.UserNotFoundException;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import com.anucode.dispensary.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    private final TenantRepository tenantRepository;

    public UserServiceImpl(UserRepository userRepository, ModelMapper modelMapper, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.tenantRepository = tenantRepository;
    }

    @Override
    public UserResponseDto createUser(UUID tenantId, UserRequestDto requestDto) {
        if (userRepository.existsByTenantIdAndUsername(tenantId, requestDto.getUsername())) {
            throw new IllegalArgumentException("Username already exists for this tenant");
        }
        User user = modelMapper.map(requestDto, User.class);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new TenantMismatchException("Tenant mismatch"));
        user.setTenant(tenant);

        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        return modelMapper.map(user, UserResponseDto.class);
    }

    @Override
    public UserResponseDto getUserById(UUID tenantId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));
        if (!user.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }
        return modelMapper.map(user, UserResponseDto.class);
    }

    @Override
    public UserResponseDto updateUser(UUID tenantId, UUID userId, UserRequestDto requestDto) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (!existingUser.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        // username NOT facilitated to update

        if (requestDto.getFullName() != null) {
            existingUser.setFullName(requestDto.getFullName());
        }
        if (requestDto.getEmail() != null) {
            existingUser.setEmail(requestDto.getEmail());
        }
        if (requestDto.getPhone() != null) {
            existingUser.setPhone(requestDto.getPhone());
        }
        if (requestDto.getRole() != null) {
            existingUser.setRole(requestDto.getRole());

            // DoctorCharge rule: must be null if role is not DOCTOR
            if (requestDto.getRole() != User.Role.DOCTOR) {
                existingUser.setDoctorCharge(null);
            } else if (requestDto.getDoctorCharge() != null) {
                existingUser.setDoctorCharge(requestDto.getDoctorCharge());
            }
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(existingUser);
        return modelMapper.map(existingUser, UserResponseDto.class);

    }

    @Override
    public List<UserResponseDto> getAllUsers(UUID tenantId, List<User.Role> roles) {
        List<User> users;

        // filter from one or more roles if given
        if (roles != null && !roles.isEmpty()) {
            users = userRepository.findAllByTenantIdAndRoleIn(tenantId, roles);
        } else {
            users = userRepository.findAllByTenantId(tenantId);
        }

        return users.stream()
                .map(user -> modelMapper.map(user, UserResponseDto.class))
                .collect(Collectors.toList());
    }
}


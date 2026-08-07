package com.anucode.dispensary.services.serviceImpl;


import com.anucode.dispensary.dtos.UserRequestDto;
import com.anucode.dispensary.dtos.UserResponseDto;
import com.anucode.dispensary.entities.Role;
import com.anucode.dispensary.entities.Tenant;
import com.anucode.dispensary.entities.User;
import com.anucode.dispensary.exception.TenantMismatchException;
import com.anucode.dispensary.exception.UserNotFoundException;
import com.anucode.dispensary.repos.RoleRepository;
import com.anucode.dispensary.repos.TenantRepository;
import com.anucode.dispensary.repos.UserRepository;
import com.anucode.dispensary.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    private final TenantRepository tenantRepository;

    private final RoleRepository roleRepository;

    public UserServiceImpl(UserRepository userRepository, ModelMapper modelMapper, TenantRepository tenantRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.tenantRepository = tenantRepository;
        this.roleRepository = roleRepository;
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
        return mapToDto(user);
    }

    @Override
    public UserResponseDto getUserById(UUID tenantId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));
        if (!user.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }
        return mapToDto(user);
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
        if (requestDto.getDoctorCharge() != null) {
            existingUser.setDoctorCharge(requestDto.getDoctorCharge());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(existingUser);
        return mapToDto(existingUser);

    }

    @Override
    public List<UserResponseDto> getAllUsers(UUID tenantId, List<String> roles) {
        List<User> users = userRepository.findAllByTenantId(tenantId);

        // Filter by roles if provided
        if (roles != null && !roles.isEmpty()) {
            users = users.stream()
                    .filter(user -> user.getRoles().stream()
                            .anyMatch(role -> roles.contains(role.getName())))
                    .collect(Collectors.toList());
        }

        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void assignRole(UUID tenantId, UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (!user.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role with ID " + roleId + " not found"));

        // Validate custom role's tenant matches user's tenant
        if (role.getTenant() != null && !role.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Cannot assign role from different tenant");
        }

        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Override
    public void unassignRole(UUID tenantId, UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + userId + " not found"));

        if (!user.getTenant().getId().equals(tenantId)) {
            throw new TenantMismatchException("Tenant mismatch");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role with ID " + roleId + " not found"));

        // Prevent removing a user's last role
        if (user.getRoles().size() <= 1) {
            throw new IllegalStateException("Cannot remove user's last role");
        }

        user.getRoles().remove(role);
        userRepository.save(user);
    }

    private UserResponseDto mapToDto(User user) {
        UserResponseDto dto = modelMapper.map(user, UserResponseDto.class);
        
        // Map roles to role names
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        dto.setRoles(roleNames);
        
        // Compute effective permissions (union across all roles)
        Set<String> permissionCodes = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(com.anucode.dispensary.entities.Permission::getCode)
                .collect(Collectors.toSet());
        dto.setPermissions(permissionCodes.stream().sorted().collect(Collectors.toList()));
        
        return dto;
    }
}


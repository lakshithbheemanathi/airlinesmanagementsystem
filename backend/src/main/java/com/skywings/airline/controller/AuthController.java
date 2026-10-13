package com.skywings.airline.controller;

import com.skywings.airline.dto.request.LoginRequest;
import com.skywings.airline.dto.request.RegisterRequest;
import com.skywings.airline.dto.response.ApiResponse;
import com.skywings.airline.dto.response.JwtResponse;
import com.skywings.airline.entity.Role;
import com.skywings.airline.entity.User;
import com.skywings.airline.repository.RoleRepository;
import com.skywings.airline.repository.UserRepository;
import com.skywings.airline.security.JwtUtils;
import com.skywings.airline.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller handling user authentication: registration, login, and current session inspection.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail().trim().toLowerCase(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(item -> item.getAuthority())
                    .orElse("ROLE_USER");

            JwtResponse jwtResponse = new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getFullName(),
                    userDetails.getUsername(),
                    userDetails.getPhone(),
                    role
            );

            return ResponseEntity.ok(ApiResponse.ok("Login successful! Welcome back, " + userDetails.getFullName(), jwtResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password. Please check your credentials."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: An account with email " + email + " already exists!"));
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        User user = new User(
                registerRequest.getFullName().trim(),
                email,
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone(),
                userRole
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully! You can now log in with your credentials."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", userDetails.getId());
        profile.put("fullName", userDetails.getFullName());
        profile.put("email", userDetails.getUsername());
        profile.put("phone", userDetails.getPhone());
        profile.put("role", userDetails.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("ROLE_USER"));

        return ResponseEntity.ok(ApiResponse.ok("Current user profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User account not found"));

        if (body.containsKey("fullName") && body.get("fullName") != null && !body.get("fullName").trim().isEmpty()) {
            user.setFullName(body.get("fullName").trim());
        }
        if (body.containsKey("phone") && body.get("phone") != null) {
            user.setPhone(body.get("phone").trim());
        }
        if (body.containsKey("newPassword") && body.get("newPassword") != null && body.get("newPassword").length() >= 6) {
            user.setPassword(passwordEncoder.encode(body.get("newPassword")));
        }

        User updated = userRepository.save(user);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", updated.getId());
        profile.put("fullName", updated.getFullName());
        profile.put("email", updated.getEmail());
        profile.put("phone", updated.getPhone());
        profile.put("role", updated.getRole().getName());

        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", profile));
    }
}

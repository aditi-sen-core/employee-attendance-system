package com.attendance.backend.controller;

import com.attendance.backend.dto.LoginRequest;
import com.attendance.backend.dto.LoginResponse;
import com.attendance.backend.entity.Employee;
import com.attendance.backend.repository.EmployeeRepository;
import com.attendance.backend.security.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // =========================================================
    // LOGIN
    // =========================================================
    //
    // POST /api/auth/login
    //
    // Returns JWT when credentials are valid.
    // =========================================================

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password"
                        )
                );


        // -----------------------------------------------------
        // Verify password
        // -----------------------------------------------------

        if (!passwordEncoder.matches(
                request.getPassword(),
                employee.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }


        // -----------------------------------------------------
        // Generate JWT
        // -----------------------------------------------------

        String token = jwtService.generateToken(
                employee.getEmail(),
                employee.getRole()
        );


        // -----------------------------------------------------
        // Return login response
        // -----------------------------------------------------

        return new LoginResponse(
                token,
                employee.getId(),
                employee.getName(),
                employee.getRole()
        );
    }
}
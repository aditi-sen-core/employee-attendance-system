package com.attendance.backend.security;

import com.attendance.backend.entity.Employee;
import com.attendance.backend.repository.EmployeeRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            EmployeeRepository employeeRepository) {

        this.jwtService = jwtService;
        this.employeeRepository = employeeRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // =========================================================
        // GET AUTHORIZATION HEADER
        // =========================================================

        String authHeader =
                request.getHeader("Authorization");

        // No JWT provided.
        // Spring Security will handle authorization.
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }


        // =========================================================
        // EXTRACT TOKEN
        // =========================================================

        String token = authHeader.substring(7);

        try {

            // =====================================================
            // EXTRACT EMAIL FROM JWT
            // =====================================================

            String email =
                    jwtService.extractEmail(token);

            if (email == null || email.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }


            // =====================================================
            // CHECK EXISTING AUTHENTICATION
            // =====================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() != null) {

                filterChain.doFilter(request, response);
                return;
            }


            // =====================================================
            // FIND EMPLOYEE
            // =====================================================

            Employee employee =
                    employeeRepository
                            .findByEmail(email)
                            .orElse(null);

            if (employee == null) {

                filterChain.doFilter(request, response);
                return;
            }


            // =====================================================
            // CREATE ROLE
            // =====================================================

            String role = employee.getRole();

            if (role == null || role.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }

            // Prevent ROLE_ROLE_HR if database contains ROLE_HR.
            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            String authority = "ROLE_" + role;


            // =====================================================
            // CREATE AUTHENTICATION
            // =====================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            employee.getEmail(),
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            authority
                                    )
                            )
                    );


            // =====================================================
            // SET SECURITY CONTEXT
            // =====================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } catch (Exception e) {

            // Don't expose JWT details to the client.
            // Log only the failure on the server.

            logger.debug(
                    "JWT authentication failed: {}",
                    e.getMessage()
            );
        }


        // =========================================================
        // CONTINUE REQUEST
        // =========================================================

        filterChain.doFilter(request, response);
    }
}
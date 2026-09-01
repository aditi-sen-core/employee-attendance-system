package com.attendance.backend.dto;

public class LoginResponse {

    private String token;
    private Long employeeId;
    private String name;
    private String role;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            Long employeeId,
            String name,
            String role) {

        this.token = token;
        this.employeeId = employeeId;
        this.name = name;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }
}
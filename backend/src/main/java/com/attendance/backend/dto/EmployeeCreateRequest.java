package com.attendance.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public class EmployeeCreateRequest {

    // =========================================================
    // EMPLOYEE NAME
    // =========================================================

    @NotBlank(message = "Name is required")
    private String name;


    // =========================================================
    // EMAIL
    // =========================================================

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;


    // =========================================================
    // PASSWORD
    // =========================================================

    @NotBlank(message = "Password is required")
    private String password;


    // =========================================================
    // ROLE
    // =========================================================

    @NotBlank(message = "Role is required")
    private String role;


    // =========================================================
    // DEPARTMENT
    // =========================================================

    @NotBlank(message = "Department is required")
    private String department;


    // =========================================================
    // JOINING DATE
    // =========================================================

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;


    // =========================================================
    // LEAVE BALANCE
    // =========================================================

    @PositiveOrZero(message = "Leave balance cannot be negative")
    private Double leaveBalance = 20.0;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmployeeCreateRequest() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }


    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }


    public Double getLeaveBalance() {
        return leaveBalance;
    }

    public void setLeaveBalance(Double leaveBalance) {
        this.leaveBalance = leaveBalance;
    }
}
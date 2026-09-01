package com.attendance.backend.controller;

import com.attendance.backend.dto.EmployeeCreateRequest;
import com.attendance.backend.dto.EmployeeUpdateRequest;
import com.attendance.backend.entity.Employee;
import com.attendance.backend.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }


    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================
    // HR only
    //
    // GET /api/employees

    @GetMapping
    public List<Employee> getAllEmployees() {

        return employeeService.getAllEmployees();
    }


    // =========================================================
    // GET MY PROFILE
    // =========================================================
    // Employee + HR
    //
    // GET /api/employees/me

    @GetMapping("/me")
    public Employee getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return employeeService.getEmployeeByEmail(email);
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================
    // HR only
    //
    // GET /api/employees/{id}

    @GetMapping("/{id}")
    public Employee getEmployeeById(
            @PathVariable Long id) {

        return employeeService.getEmployeeById(id);
    }


    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================
    // HR only
    //
    // POST /api/employees

    @PostMapping
    public Employee createEmployee(
            @Valid @RequestBody EmployeeCreateRequest employee) {

        return employeeService.createEmployee(employee);
    }


    // =========================================================
    // UPDATE EMPLOYEE
    // =========================================================
    // HR only
    //
    // PUT /api/employees/{id}

    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest employee) {

        return employeeService.updateEmployee(
                id,
                employee
        );
    }


    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================
    // HR only
    //
    // DELETE /api/employees/{id}

    @DeleteMapping("/{id}")
    public String deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return "Employee deleted successfully";
    }
}
package com.attendance.backend.service;

import com.attendance.backend.dto.EmployeeCreateRequest;
import com.attendance.backend.dto.EmployeeUpdateRequest;
import com.attendance.backend.entity.Employee;
import com.attendance.backend.exception.ResourceNotFoundException;
import com.attendance.backend.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================

    public Employee getEmployeeById(Long id) {

        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        ));
    }


    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    public Employee createEmployee(
            EmployeeCreateRequest request) {

        // -----------------------------------------------------
        // Check duplicate email
        // -----------------------------------------------------

        if (employeeRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "An employee with this email already exists"
            );
        }


        Employee employee = new Employee();


        // -----------------------------------------------------
        // Copy employee information from DTO
        // -----------------------------------------------------

        employee.setName(
                request.getName()
        );

        employee.setEmail(
                request.getEmail()
        );

        employee.setRole(
                request.getRole()
        );

        employee.setDepartment(
                request.getDepartment()
        );

        employee.setJoiningDate(
                request.getJoiningDate()
        );


        // -----------------------------------------------------
        // Leave balance
        // -----------------------------------------------------

        if (request.getLeaveBalance() == null) {

            employee.setLeaveBalance(20.0);

        } else {

            employee.setLeaveBalance(
                    request.getLeaveBalance()
            );
        }


        // -----------------------------------------------------
        // Password
        // -----------------------------------------------------
        // Store only the BCrypt hashed password.

        employee.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        // -----------------------------------------------------
        // Creation time
        // -----------------------------------------------------

        employee.setCreatedAt(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // Save employee
        // -----------------------------------------------------

        return employeeRepository.save(employee);
    }


    // =========================================================
    // GET EMPLOYEE BY EMAIL
    // =========================================================

    public Employee getEmployeeByEmail(String email) {

        return employeeRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        ));
    }


    // =========================================================
    // UPDATE EMPLOYEE
    // =========================================================

    public Employee updateEmployee(
            Long id,
            EmployeeUpdateRequest updatedEmployee) {

        Employee existingEmployee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found"
                                ));


        // -----------------------------------------------------
        // Check duplicate email
        // -----------------------------------------------------
        // The email can remain the same for this employee.
        // But it cannot belong to another employee.

        Employee employeeWithEmail =
                employeeRepository
                        .findByEmail(updatedEmployee.getEmail())
                        .orElse(null);

        if (employeeWithEmail != null &&
                !employeeWithEmail.getId().equals(id)) {

            throw new RuntimeException(
                    "An employee with this email already exists"
            );
        }


        // -----------------------------------------------------
        // Update basic information
        // -----------------------------------------------------

        existingEmployee.setName(
                updatedEmployee.getName()
        );

        existingEmployee.setEmail(
                updatedEmployee.getEmail()
        );

        existingEmployee.setRole(
                updatedEmployee.getRole()
        );

        existingEmployee.setDepartment(
                updatedEmployee.getDepartment()
        );

        existingEmployee.setJoiningDate(
                updatedEmployee.getJoiningDate()
        );

        existingEmployee.setLeaveBalance(
                updatedEmployee.getLeaveBalance()
        );


        // -----------------------------------------------------
        // Password
        // -----------------------------------------------------
        // Only change password if one was provided.

        if (updatedEmployee.getPassword() != null &&
                !updatedEmployee.getPassword().isBlank()) {

            existingEmployee.setPassword(
                    passwordEncoder.encode(
                            updatedEmployee.getPassword()
                    )
            );
        }


        // -----------------------------------------------------
        // Save updated employee
        // -----------------------------------------------------

        return employeeRepository.save(existingEmployee);
    }


    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    public void deleteEmployee(Long id) {

        if (!employeeRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Employee not found"
            );
        }

        employeeRepository.deleteById(id);
    }
}
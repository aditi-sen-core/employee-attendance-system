package com.attendance.backend.service;

import com.attendance.backend.entity.Employee;
import com.attendance.backend.entity.Leave;
import com.attendance.backend.exception.ResourceNotFoundException;
import com.attendance.backend.repository.EmployeeRepository;
import com.attendance.backend.repository.LeaveRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }


    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================

    public Leave applyForLeave(
            Leave leave,
            Authentication authentication) {

        String loggedInEmail = authentication.getName();

        // -----------------------------------------------------
        // Find logged-in employee
        // -----------------------------------------------------

        Employee employee = employeeRepository
                .findByEmail(loggedInEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        ));


        // -----------------------------------------------------
        // Validate dates
        // -----------------------------------------------------

        if (leave.getStartDate() == null ||
                leave.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (leave.getEndDate()
                .isBefore(leave.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }


        // -----------------------------------------------------
        // Prevent applying for past dates
        // -----------------------------------------------------

        if (leave.getStartDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Leave cannot start in the past"
            );
        }


        // -----------------------------------------------------
        // Validate reason
        // -----------------------------------------------------

        if (leave.getReason() == null ||
                leave.getReason().trim().isEmpty()) {

            throw new RuntimeException(
                    "Leave reason is required"
            );
        }


        // -----------------------------------------------------
        // Calculate number of leave days
        // -----------------------------------------------------

        long numberOfDays =
                leave.getStartDate()
                        .datesUntil(
                                leave.getEndDate().plusDays(1)
                        )
                        .count();


        // -----------------------------------------------------
        // Validate leave balance
        // -----------------------------------------------------

        if (employee.getLeaveBalance() == null) {

            employee.setLeaveBalance(0.0);
        }

        if (numberOfDays >
                employee.getLeaveBalance()) {

            throw new RuntimeException(
                    "Insufficient leave balance"
            );
        }


        // -----------------------------------------------------
        // Check overlapping leave
        // -----------------------------------------------------
        //
        // Only PENDING and APPROVED leaves matter.
        // REJECTED leaves are ignored.
        //

        List<Leave> existingLeaves =
                leaveRepository.findByEmployeeIdAndStatusIn(
                        employee.getId(),
                        List.of("PENDING", "APPROVED")
                );

        for (Leave existingLeave : existingLeaves) {

            LocalDate existingStart =
                    existingLeave.getStartDate();

            LocalDate existingEnd =
                    existingLeave.getEndDate();

            // Skip invalid old records
            if (existingStart == null ||
                    existingEnd == null) {
                continue;
            }

            // -------------------------------------------------
            // Check whether the date ranges overlap
            // -------------------------------------------------
            //
            // Example:
            //
            // Existing: 10 - 15
            // New:      12 - 14
            //
            // Result: OVERLAP
            //

            boolean overlaps =
                    !leave.getEndDate()
                            .isBefore(existingStart)
                    &&
                    !leave.getStartDate()
                            .isAfter(existingEnd);

            if (overlaps) {

                throw new RuntimeException(
                        "Leave dates overlap with an existing leave request"
                );
            }
        }


        // -----------------------------------------------------
        // Create leave request
        // -----------------------------------------------------

        leave.setEmployee(employee);

        // Client cannot decide status
        leave.setStatus("PENDING");

        // Set application time on server
        leave.setAppliedAt(
                LocalDateTime.now()
        );

        // New request has not been reviewed
        leave.setReviewedAt(null);

        return leaveRepository.save(leave);
    }


    // =========================================================
    // GET MY LEAVE REQUESTS
    // =========================================================

    public List<Leave> getMyLeaves(
            Authentication authentication) {

        String loggedInEmail = authentication.getName();

        Employee employee = employeeRepository
                .findByEmail(loggedInEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        ));

        return leaveRepository.findByEmployeeId(
                employee.getId()
        );
    }


    // =========================================================
    // GET ALL LEAVE REQUESTS
    // =========================================================
    // HR only
    //
    // SecurityConfig handles authorization.

    public List<Leave> getAllLeaves() {

        return leaveRepository.findAll();
    }


    // =========================================================
    // GET PENDING LEAVE REQUESTS
    // =========================================================
    // HR only

    public List<Leave> getPendingLeaves() {

        return leaveRepository.findByStatus("PENDING");
    }


    // =========================================================
    // APPROVE LEAVE
    // =========================================================
    // HR only

    @Transactional
    public Leave approveLeave(Long leaveId) {

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Leave request not found"
                        ));


        // -----------------------------------------------------
        // Only PENDING requests can be approved
        // -----------------------------------------------------

        if (!"PENDING".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "Leave request has already been processed"
            );
        }


        // -----------------------------------------------------
        // Validate leave dates
        // -----------------------------------------------------

        if (leave.getStartDate() == null ||
                leave.getEndDate() == null) {

            throw new RuntimeException(
                    "Leave dates are invalid"
            );
        }

        if (leave.getEndDate()
                .isBefore(leave.getStartDate())) {

            throw new RuntimeException(
                    "Leave dates are invalid"
            );
        }


        // -----------------------------------------------------
        // Calculate leave days
        // -----------------------------------------------------

        long numberOfDays =
                leave.getStartDate()
                        .datesUntil(
                                leave.getEndDate().plusDays(1)
                        )
                        .count();


        Employee employee = leave.getEmployee();


        // -----------------------------------------------------
        // Double-check leave balance
        // -----------------------------------------------------

        if (employee.getLeaveBalance() == null) {

            throw new RuntimeException(
                    "Employee has no leave balance"
            );
        }

        if (numberOfDays >
                employee.getLeaveBalance()) {

            throw new RuntimeException(
                    "Insufficient leave balance"
            );
        }


        // -----------------------------------------------------
        // Double-check overlapping approved leave
        // -----------------------------------------------------
        //
        // This protects us if another pending request
        // was approved before this request.
        //

        List<Leave> existingLeaves =
                leaveRepository.findByEmployeeIdAndStatusIn(
                        employee.getId(),
                        List.of("APPROVED")
                );

        for (Leave existingLeave : existingLeaves) {

            // Don't compare the leave with itself
            if (existingLeave.getId()
                    .equals(leave.getId())) {
                continue;
            }

            LocalDate existingStart =
                    existingLeave.getStartDate();

            LocalDate existingEnd =
                    existingLeave.getEndDate();

            if (existingStart == null ||
                    existingEnd == null) {
                continue;
            }

            boolean overlaps =
                    !leave.getEndDate()
                            .isBefore(existingStart)
                    &&
                    !leave.getStartDate()
                            .isAfter(existingEnd);

            if (overlaps) {

                throw new RuntimeException(
                        "Leave dates overlap with an already approved leave"
                );
            }
        }


        // -----------------------------------------------------
        // Deduct leave balance
        // -----------------------------------------------------

        employee.setLeaveBalance(
                employee.getLeaveBalance()
                        - numberOfDays
        );


        // -----------------------------------------------------
        // Update leave request
        // -----------------------------------------------------

        leave.setStatus("APPROVED");

        leave.setReviewedAt(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // Save both changes in one transaction
        // -----------------------------------------------------

        employeeRepository.save(employee);

        return leaveRepository.save(leave);
    }


    // =========================================================
    // REJECT LEAVE
    // =========================================================
    // HR only

    public Leave rejectLeave(Long leaveId) {

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Leave request not found"
                        ));


        // -----------------------------------------------------
        // Only PENDING requests can be rejected
        // -----------------------------------------------------

        if (!"PENDING".equals(leave.getStatus())) {

            throw new RuntimeException(
                    "Leave request has already been processed"
            );
        }


        // -----------------------------------------------------
        // Reject request
        // -----------------------------------------------------

        leave.setStatus("REJECTED");

        leave.setReviewedAt(
                LocalDateTime.now()
        );

        return leaveRepository.save(leave);
    }
}
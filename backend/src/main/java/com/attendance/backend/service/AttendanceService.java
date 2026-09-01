package com.attendance.backend.service;

import com.attendance.backend.dto.AttendanceStatisticsResponse;
import com.attendance.backend.entity.Attendance;
import com.attendance.backend.entity.Employee;
import com.attendance.backend.exception.ResourceNotFoundException;
import com.attendance.backend.repository.AttendanceRepository;
import com.attendance.backend.repository.EmployeeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }


    // =========================================================
    // EMPLOYEE CHECK-IN
    // =========================================================

    public Attendance checkIn(
            Long employeeId,
            Authentication authentication) {

        Employee employee =
                getAuthorizedEmployee(
                        employeeId,
                        authentication
                );

        LocalDate today = LocalDate.now();

        // Prevent multiple check-ins on the same day.
        if (attendanceRepository
                .findByEmployeeIdAndAttendanceDate(
                        employeeId,
                        today
                )
                .isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee has already checked in today"
            );
        }

        Attendance attendance = new Attendance();

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setStatus("PRESENT");

        return attendanceRepository.save(attendance);
    }


    // =========================================================
    // EMPLOYEE CHECK-OUT
    // =========================================================

    public Attendance checkOut(
            Long attendanceId,
            Authentication authentication) {

        Attendance attendance =
                attendanceRepository.findById(attendanceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Attendance record not found"
                                ));

        Employee employee = attendance.getEmployee();

        authorizeEmployeeAccess(
                employee,
                authentication
        );

        // Prevent multiple check-outs.
        if (attendance.getCheckOutTime() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee has already checked out"
            );
        }

        attendance.setCheckOutTime(
                LocalDateTime.now()
        );

        return attendanceRepository.save(attendance);
    }


    // =========================================================
    // GET EMPLOYEE ATTENDANCE
    // =========================================================

    public List<Attendance> getEmployeeAttendance(
            Long employeeId,
            Authentication authentication) {

        getAuthorizedEmployee(
                employeeId,
                authentication
        );

        return attendanceRepository
                .findByEmployeeId(employeeId);
    }


    // =========================================================
    // GET ALL ATTENDANCE - HR ONLY
    // =========================================================

    public List<Attendance> getAllAttendance(
            Authentication authentication) {

        boolean isHR =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_HR")
                        );

        if (!isHR) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only HR can access all attendance records"
            );
        }

        return attendanceRepository.findAll();
    }


    // =========================================================
    // GET ATTENDANCE BY DATE RANGE
    // =========================================================

    public List<Attendance> getEmployeeAttendanceByDateRange(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            Authentication authentication) {

        validateDateRange(startDate, endDate);

        getAuthorizedEmployee(
                employeeId,
                authentication
        );

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(
                        employeeId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // GET ATTENDANCE STATISTICS
    // =========================================================

    public AttendanceStatisticsResponse getAttendanceStatistics(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            Authentication authentication) {

        validateDateRange(startDate, endDate);

        getAuthorizedEmployee(
                employeeId,
                authentication
        );

        List<Attendance> attendanceList =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDateBetween(
                                employeeId,
                                startDate,
                                endDate
                        );

        long totalDays = attendanceList.size();

        long presentDays = attendanceList.stream()
                .filter(attendance ->
                        "PRESENT".equals(
                                attendance.getStatus()
                        ))
                .count();

        double totalHoursWorked = 0.0;

        for (Attendance attendance : attendanceList) {

            LocalDateTime checkIn =
                    attendance.getCheckInTime();

            LocalDateTime checkOut =
                    attendance.getCheckOutTime();

            // Only completed attendance records
            // contribute to working hours.
            if (checkIn != null && checkOut != null) {

                long minutes =
                        Duration.between(
                                checkIn,
                                checkOut
                        ).toMinutes();

                totalHoursWorked += minutes / 60.0;
            }
        }

        totalHoursWorked =
                Math.round(
                        totalHoursWorked * 100.0
                ) / 100.0;

        return new AttendanceStatisticsResponse(
                employeeId,
                totalDays,
                presentDays,
                totalHoursWorked
        );
    }


    // =========================================================
    // FIND + AUTHORIZE EMPLOYEE
    // =========================================================

    private Employee getAuthorizedEmployee(
            Long employeeId,
            Authentication authentication) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found"
                                ));

        authorizeEmployeeAccess(
                employee,
                authentication
        );

        return employee;
    }


    // =========================================================
    // AUTHORIZE EMPLOYEE ACCESS
    // =========================================================

    private void authorizeEmployeeAccess(
            Employee employee,
            Authentication authentication) {

        String loggedInEmail =
                authentication.getName();

        boolean isHR =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_HR")
                        );

        // HR can access any employee.
        // Employees can only access themselves.
        if (!isHR &&
                !employee.getEmail().equals(loggedInEmail)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access another employee's attendance"
            );
        }
    }


    // =========================================================
    // VALIDATE DATE RANGE
    // =========================================================

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date"
            );
        }
    }
}
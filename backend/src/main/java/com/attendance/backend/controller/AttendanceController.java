package com.attendance.backend.controller;

import com.attendance.backend.dto.AttendanceStatisticsResponse;
import com.attendance.backend.entity.Attendance;
import com.attendance.backend.service.AttendanceService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }


    // =========================================================
    // CHECK-IN
    // =========================================================

    @PostMapping("/check-in/{employeeId}")
    public Attendance checkIn(
            @PathVariable Long employeeId,
            Authentication authentication) {

        return attendanceService.checkIn(
                employeeId,
                authentication
        );
    }


    // =========================================================
    // CHECK-OUT
    // =========================================================

    @PutMapping("/check-out/{attendanceId}")
    public Attendance checkOut(
            @PathVariable Long attendanceId,
            Authentication authentication) {

        return attendanceService.checkOut(
                attendanceId,
                authentication
        );
    }


    // =========================================================
    // GET EMPLOYEE ATTENDANCE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getEmployeeAttendance(
            @PathVariable Long employeeId,
            Authentication authentication) {

        return attendanceService.getEmployeeAttendance(
                employeeId,
                authentication
        );
    }


    // =========================================================
    // GET ALL ATTENDANCE - HR ONLY
    // =========================================================

    @GetMapping
    public List<Attendance> getAllAttendance(
            Authentication authentication) {

        return attendanceService.getAllAttendance(
                authentication
        );
    }


    // =========================================================
    // GET EMPLOYEE ATTENDANCE BY DATE RANGE
    // =========================================================

    @GetMapping("/employee/{employeeId}/range")
    public List<Attendance> getEmployeeAttendanceByDateRange(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            Authentication authentication) {

        return attendanceService.getEmployeeAttendanceByDateRange(
                employeeId,
                startDate,
                endDate,
                authentication
        );
    }


    // =========================================================
    // GET ATTENDANCE STATISTICS
    // =========================================================

    @GetMapping("/employee/{employeeId}/statistics")
    public AttendanceStatisticsResponse getAttendanceStatistics(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            Authentication authentication) {

        return attendanceService.getAttendanceStatistics(
                employeeId,
                startDate,
                endDate,
                authentication
        );
    }
}
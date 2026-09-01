package com.attendance.backend.repository;

import com.attendance.backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // Get all leave requests of an employee
    List<Leave> findByEmployeeId(Long employeeId);

    // Get leave requests by status
    List<Leave> findByStatus(String status);

    // Get leave requests of an employee with a specific status
    List<Leave> findByEmployeeIdAndStatus(
            Long employeeId,
            String status
    );

    // Get pending and approved leaves of an employee
    List<Leave> findByEmployeeIdAndStatusIn(
            Long employeeId,
            List<String> statuses
    );
}
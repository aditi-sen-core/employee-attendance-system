package com.attendance.backend.dto;

public class AttendanceStatisticsResponse {

    private Long employeeId;

    private long totalDays;

    private long presentDays;

    private double totalHoursWorked;

    public AttendanceStatisticsResponse() {
    }

    public AttendanceStatisticsResponse(
            Long employeeId,
            long totalDays,
            long presentDays,
            double totalHoursWorked) {

        this.employeeId = employeeId;
        this.totalDays = totalDays;
        this.presentDays = presentDays;
        this.totalHoursWorked = totalHoursWorked;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public long getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(long totalDays) {
        this.totalDays = totalDays;
    }

    public long getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(long presentDays) {
        this.presentDays = presentDays;
    }

    public double getTotalHoursWorked() {
        return totalHoursWorked;
    }

    public void setTotalHoursWorked(double totalHoursWorked) {
        this.totalHoursWorked = totalHoursWorked;
    }
}
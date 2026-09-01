-- =========================================================
-- EMPLOYEE ATTENDANCE SYSTEM
-- DATABASE SCHEMA
-- =========================================================

CREATE DATABASE IF NOT EXISTS employee_attendance;

USE employee_attendance;


-- =========================================================
-- EMPLOYEES
-- =========================================================

CREATE TABLE IF NOT EXISTS employees (

    id BIGINT NOT NULL AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(255) NOT NULL,

    department VARCHAR(255) NOT NULL,

    joining_date DATE,

    leave_balance DOUBLE NOT NULL DEFAULT 20.0,

    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_employee_email (email)
);


-- =========================================================
-- ATTENDANCE
-- =========================================================

CREATE TABLE IF NOT EXISTS attendance (

    id BIGINT NOT NULL AUTO_INCREMENT,

    employee_id BIGINT NOT NULL,

    attendance_date DATE NOT NULL,

    check_in_time DATETIME,

    check_out_time DATETIME,

    status VARCHAR(50),

    PRIMARY KEY (id),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    UNIQUE KEY uk_employee_attendance_date
        (employee_id, attendance_date)
);


-- =========================================================
-- LEAVES
-- =========================================================

CREATE TABLE IF NOT EXISTS leaves (

    id BIGINT NOT NULL AUTO_INCREMENT,

    employee_id BIGINT NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    reason VARCHAR(500) NOT NULL,

    status VARCHAR(20) NOT NULL,

    applied_at DATETIME NOT NULL,

    reviewed_at DATETIME,

    PRIMARY KEY (id),

    CONSTRAINT fk_leave_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_attendance_employee
    ON attendance(employee_id);

CREATE INDEX idx_attendance_date
    ON attendance(attendance_date);

CREATE INDEX idx_leave_employee
    ON leaves(employee_id);

CREATE INDEX idx_leave_status
    ON leaves(status);

CREATE INDEX idx_leave_employee_status
    ON leaves(employee_id, status);
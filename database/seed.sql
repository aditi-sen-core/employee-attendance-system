-- =========================================================
-- EMPLOYEE ATTENDANCE SYSTEM
-- DEMO / SEED DATA
-- =========================================================

USE employee_attendance;

START TRANSACTION;


-- =========================================================
-- 1. GET EXISTING PASSWORD HASH
-- =========================================================
-- We reuse the BCrypt hash of the existing demo employee.
-- Therefore all generated demo users can log in using:
--
-- Password: pass123
--
-- assuming employee@demo.com currently uses pass123.

SET @demo_password = (
    SELECT password
    FROM employees
    WHERE email = 'employee@demo.com'
    LIMIT 1
);


-- =========================================================
-- 2. INSERT DEMO EMPLOYEES
-- =========================================================
-- Existing employees are NOT touched.
--
-- Total after this:
-- 5 existing + 25 new = 30 employees
-- =========================================================

INSERT INTO employees
(
    name,
    email,
    password,
    role,
    department,
    joining_date,
    leave_balance,
    created_at
)
SELECT
    new_data.name,
    new_data.email,
    @demo_password,
    'EMPLOYEE',
    new_data.department,
    new_data.joining_date,
    new_data.leave_balance,
    NOW()
FROM
    (
        SELECT 'Rahul Sharma' AS name,
               'rahul.sharma@demo.com' AS email,
               'Engineering' AS department,
               '2025-02-10' AS joining_date,
               18.0 AS leave_balance

        UNION ALL
        SELECT 'Priya Mehta',
               'priya.mehta@demo.com',
               'Human Resources',
               '2025-03-15',
               16.0

        UNION ALL
        SELECT 'Arjun Verma',
               'arjun.verma@demo.com',
               'Engineering',
               '2025-04-02',
               19.0

        UNION ALL
        SELECT 'Sneha Kapoor',
               'sneha.kapoor@demo.com',
               'Finance',
               '2025-05-20',
               15.0

        UNION ALL
        SELECT 'Rohan Gupta',
               'rohan.gupta@demo.com',
               'Engineering',
               '2025-06-11',
               17.0

        UNION ALL
        SELECT 'Aditi Singh',
               'aditi.singh@demo.com',
               'Marketing',
               '2025-07-08',
               20.0

        UNION ALL
        SELECT 'Karan Malhotra',
               'karan.malhotra@demo.com',
               'Sales',
               '2025-08-14',
               14.0

        UNION ALL
        SELECT 'Neha Joshi',
               'neha.joshi@demo.com',
               'Human Resources',
               '2025-09-01',
               18.0

        UNION ALL
        SELECT 'Vikram Rao',
               'vikram.rao@demo.com',
               'Engineering',
               '2025-09-18',
               16.0

        UNION ALL
        SELECT 'Ananya Iyer',
               'ananya.iyer@demo.com',
               'Finance',
               '2025-10-05',
               19.0

        UNION ALL
        SELECT 'Aditya Nair',
               'aditya.nair@demo.com',
               'Engineering',
               '2025-11-12',
               17.0

        UNION ALL
        SELECT 'Meera Shah',
               'meera.shah@demo.com',
               'Marketing',
               '2025-12-01',
               15.0

        UNION ALL
        SELECT 'Siddharth Jain',
               'siddharth.jain@demo.com',
               'Sales',
               '2026-01-10',
               18.0

        UNION ALL
        SELECT 'Pooja Agarwal',
               'pooja.agarwal@demo.com',
               'Finance',
               '2026-01-22',
               16.0

        UNION ALL
        SELECT 'Nikhil Bansal',
               'nikhil.bansal@demo.com',
               'Engineering',
               '2026-02-03',
               19.0

        UNION ALL
        SELECT 'Ishita Roy',
               'ishita.roy@demo.com',
               'Marketing',
               '2026-02-17',
               17.0

        UNION ALL
        SELECT 'Manish Tiwari',
               'manish.tiwari@demo.com',
               'Sales',
               '2026-03-05',
               14.0

        UNION ALL
        SELECT 'Riya Chatterjee',
               'riya.chatterjee@demo.com',
               'Human Resources',
               '2026-03-19',
               18.0

        UNION ALL
        SELECT 'Yash Patel',
               'yash.patel@demo.com',
               'Engineering',
               '2026-04-02',
               20.0

        UNION ALL
        SELECT 'Simran Kaur',
               'simran.kaur@demo.com',
               'Finance',
               '2026-04-16',
               15.0

        UNION ALL
        SELECT 'Varun Sethi',
               'varun.sethi@demo.com',
               'Engineering',
               '2026-05-01',
               17.0

        UNION ALL
        SELECT 'Kavya Menon',
               'kavya.menon@demo.com',
               'Marketing',
               '2026-05-14',
               19.0

        UNION ALL
        SELECT 'Harsh Vardhan',
               'harsh.vardhan@demo.com',
               'Sales',
               '2026-06-02',
               16.0

        UNION ALL
        SELECT 'Tanya Kapoor',
               'tanya.kapoor@demo.com',
               'Finance',
               '2026-06-18',
               18.0

        UNION ALL
        SELECT 'Abhishek Das',
               'abhishek.das@demo.com',
               'Engineering',
               '2026-07-01',
               17.0

    ) AS new_data
WHERE NOT EXISTS
          (
              SELECT 1
              FROM employees existing
              WHERE existing.email = new_data.email
          );


-- =========================================================
-- 3. ATTENDANCE DATA
-- =========================================================
-- Generate attendance for the 25 new employees.
--
-- 10 working days
-- × 25 employees
-- = 250 attendance records
--
-- Dates:
-- 2026-08-17 through 2026-08-28
--
-- Weekends excluded.
-- =========================================================

INSERT INTO attendance
(
    employee_id,
    attendance_date,
    check_in_time,
    check_out_time,
    status
)
SELECT
    e.id,

    d.attendance_date,

    TIMESTAMP(
            d.attendance_date,
            MAKETIME(
                    8 + MOD(e.id, 2),
                    30 + MOD(e.id * 7, 30),
                    0
            )
    ) AS check_in_time,

    TIMESTAMP(
            d.attendance_date,
            MAKETIME(
                    17 + MOD(e.id, 2),
                    15 + MOD(e.id * 5, 30),
                    0
            )
    ) AS check_out_time,

    'PRESENT'

FROM employees e

         CROSS JOIN
     (
         SELECT DATE('2026-08-17') AS attendance_date
         UNION ALL SELECT DATE('2026-08-18')
         UNION ALL SELECT DATE('2026-08-19')
         UNION ALL SELECT DATE('2026-08-20')
         UNION ALL SELECT DATE('2026-08-21')
         UNION ALL SELECT DATE('2026-08-24')
         UNION ALL SELECT DATE('2026-08-25')
         UNION ALL SELECT DATE('2026-08-26')
         UNION ALL SELECT DATE('2026-08-27')
         UNION ALL SELECT DATE('2026-08-28')
     ) d

WHERE e.email LIKE '%@demo.com'

  AND e.email NOT IN
      (
          'hr@demo.com'
          )

  AND NOT EXISTS
    (
        SELECT 1
        FROM attendance a
        WHERE a.employee_id = e.id
          AND a.attendance_date = d.attendance_date
    );


-- =========================================================
-- 4. ADD SOME MORE ATTENDANCE HISTORY
-- =========================================================
-- Additional 10 working days for the same employees.
--
-- This gives us another 250 records.
--
-- Total generated attendance:
-- approximately 500 records
-- =========================================================

INSERT INTO attendance
(
    employee_id,
    attendance_date,
    check_in_time,
    check_out_time,
    status
)
SELECT
    e.id,

    d.attendance_date,

    TIMESTAMP(
            d.attendance_date,
            MAKETIME(
                    8 + MOD(e.id, 2),
                    30 + MOD(e.id * 7, 30),
                    0
            )
    ),

    TIMESTAMP(
            d.attendance_date,
            MAKETIME(
                    17 + MOD(e.id, 2),
                    15 + MOD(e.id * 5, 30),
                    0
            )
    ),

    CASE
        WHEN MOD(e.id + DAY(d.attendance_date), 13) = 0
            THEN 'HALF_DAY'
        ELSE 'PRESENT'
        END

FROM employees e

         CROSS JOIN
     (
         SELECT DATE('2026-08-03') AS attendance_date
         UNION ALL SELECT DATE('2026-08-04')
         UNION ALL SELECT DATE('2026-08-05')
         UNION ALL SELECT DATE('2026-08-06')
         UNION ALL SELECT DATE('2026-08-07')
         UNION ALL SELECT DATE('2026-08-10')
         UNION ALL SELECT DATE('2026-08-11')
         UNION ALL SELECT DATE('2026-08-12')
         UNION ALL SELECT DATE('2026-08-13')
         UNION ALL SELECT DATE('2026-08-14')
     ) d

WHERE e.email LIKE '%@demo.com'

  AND e.email NOT IN
      (
          'hr@demo.com'
          )

  AND NOT EXISTS
    (
        SELECT 1
        FROM attendance a
        WHERE a.employee_id = e.id
          AND a.attendance_date = d.attendance_date
    );


-- =========================================================
-- 5. LEAVE REQUESTS
-- =========================================================
-- Create realistic mixture of:
--
-- APPROVED
-- REJECTED
-- PENDING
-- =========================================================


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-07',
    '2026-09-09',
    'Family vacation',
    'APPROVED',
    '2026-08-20 10:30:00',
    '2026-08-21 14:15:00'
FROM employees e
WHERE e.email = 'rahul.sharma@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-07'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-08-25',
    '2026-08-26',
    'Personal work',
    'APPROVED',
    '2026-08-18 09:20:00',
    '2026-08-19 11:00:00'
FROM employees e
WHERE e.email = 'priya.mehta@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-08-25'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-15',
    '2026-09-17',
    'Medical appointment',
    'PENDING',
    '2026-08-29 16:45:00',
    NULL
FROM employees e
WHERE e.email = 'arjun.verma@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-15'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-21',
    '2026-09-22',
    'Personal work',
    'PENDING',
    '2026-08-30 12:15:00',
    NULL
FROM employees e
WHERE e.email = 'sneha.kapoor@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-21'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-08-28',
    '2026-08-29',
    'Travel plans',
    'REJECTED',
    '2026-08-15 13:00:00',
    '2026-08-17 10:30:00'
FROM employees e
WHERE e.email = 'rohan.gupta@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-08-28'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-10',
    '2026-09-12',
    'Family function',
    'APPROVED',
    '2026-08-16 15:20:00',
    '2026-08-18 09:45:00'
FROM employees e
WHERE e.email = 'aditi.singh@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-10'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-03',
    '2026-09-04',
    'Personal work',
    'PENDING',
    '2026-08-31 10:10:00',
    NULL
FROM employees e
WHERE e.email = 'karan.malhotra@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-03'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-08-20',
    '2026-08-21',
    'Health and rest',
    'REJECTED',
    '2026-08-10 09:30:00',
    '2026-08-12 14:00:00'
FROM employees e
WHERE e.email = 'neha.joshi@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-08-20'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-25',
    '2026-09-26',
    'Out of town',
    'PENDING',
    '2026-08-30 17:00:00',
    NULL
FROM employees e
WHERE e.email = 'vikram.rao@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-25'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-08-12',
    '2026-08-14',
    'Family event',
    'APPROVED',
    '2026-08-01 11:15:00',
    '2026-08-03 13:30:00'
FROM employees e
WHERE e.email = 'ananya.iyer@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-08-12'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-14',
    '2026-09-16',
    'Personal vacation',
    'APPROVED',
    '2026-08-22 12:00:00',
    '2026-08-23 15:30:00'
FROM employees e
WHERE e.email = 'aditya.nair@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-14'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-18',
    '2026-09-19',
    'Personal work',
    'PENDING',
    '2026-08-31 15:30:00',
    NULL
FROM employees e
WHERE e.email = 'meera.shah@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-18'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-08-05',
    '2026-08-06',
    'Travel',
    'REJECTED',
    '2026-07-28 10:00:00',
    '2026-07-30 16:00:00'
FROM employees e
WHERE e.email = 'siddharth.jain@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-08-05'
    );


INSERT INTO leaves
(
    employee_id,
    start_date,
    end_date,
    reason,
    status,
    applied_at,
    reviewed_at
)
SELECT
    e.id,
    '2026-09-28',
    '2026-09-30',
    'Family vacation',
    'PENDING',
    '2026-08-31 18:00:00',
    NULL
FROM employees e
WHERE e.email = 'pooja.agarwal@demo.com'
  AND NOT EXISTS
    (
        SELECT 1
        FROM leaves l
        WHERE l.employee_id = e.id
          AND l.start_date = '2026-09-28'
    );


-- =========================================================
-- COMMIT
-- =========================================================

COMMIT;


-- =========================================================
-- VERIFICATION
-- =========================================================

SELECT
    'Employees' AS data_type,
    COUNT(*) AS total
FROM employees

UNION ALL

SELECT
    'Attendance',
    COUNT(*)
FROM attendance

UNION ALL

SELECT
    'Leave Requests',
    COUNT(*)
FROM leaves;
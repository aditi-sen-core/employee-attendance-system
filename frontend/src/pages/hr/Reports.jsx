import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Paper,
} from '@mui/material';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import employeeApi from '../../api/employeeApi';
import attendanceApi from '../../api/attendanceApi';
import leaveApi from '../../api/leaveApi';

import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatCard from '../../components/common/StatCard';

import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// =========================================================
// DATE HELPERS
// =========================================================

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    today.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


const getFirstDayOfMonth = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, '0');

  return `${year}-${month}-01`;
};


// =========================================================
// STATUS HELPER
// =========================================================

const normalizeStatus = (status) => {

  if (!status) {
    return '';
  }

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

};


// =========================================================
// REPORTS COMPONENT
// =========================================================

export const Reports = () => {

  // =======================================================
  // LOADING / ERROR STATE
  // =======================================================

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState(null);


  // =======================================================
  // DATA STATE
  // =======================================================

  const [employees, setEmployees] =
    useState([]);

  const [leaves, setLeaves] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);


  // =======================================================
  // DATE STATE
  //
  // IMPORTANT:
  //
  // draftStartDate / draftEndDate
  // are ONLY the values inside the date inputs.
  //
  // appliedStartDate / appliedEndDate
  // are the dates actually used by the report.
  //
  // Therefore typing a date does NOT continuously
  // recalculate the whole report.
  // =======================================================

  const [draftStartDate, setDraftStartDate] =
    useState(getFirstDayOfMonth());

  const [draftEndDate, setDraftEndDate] =
    useState(getToday());

  const [appliedStartDate, setAppliedStartDate] =
    useState(getFirstDayOfMonth());

  const [appliedEndDate, setAppliedEndDate] =
    useState(getToday());


  // =======================================================
  // FETCH DATA
  //
  // RUN ONLY ONCE.
  //
  // DO NOT PUT DATE VARIABLES IN THIS DEPENDENCY ARRAY.
  // =======================================================

  useEffect(() => {

    fetchReportData();

  }, []);


  // =======================================================
  // FETCH ALL REPORT DATA
  // =======================================================

  const fetchReportData = async () => {

    try {

      setLoading(true);

      setError(null);


      // ---------------------------------------------------
      // Get employees and leaves
      // ---------------------------------------------------

      const [
        employeesResponse,
        leavesResponse,
      ] = await Promise.all([

        employeeApi.getAllEmployees(),

        leaveApi.getAllLeaves(),

      ]);


      const employeeData =
        employeesResponse.data || [];

      const leaveData =
        leavesResponse.data || [];


      setEmployees(employeeData);

      setLeaves(leaveData);


      // ---------------------------------------------------
      // Get attendance for every employee
      //
      // This happens ONCE when the page loads.
      // ---------------------------------------------------

      const attendanceResponses =
        await Promise.all(

          employeeData.map(
            (employee) =>
              attendanceApi.getEmployeeAttendance(
                employee.id
              )
          )

        );


      const attendanceData =
        attendanceResponses.flatMap(
          (response) =>
            response.data || []
        );


      setAttendance(attendanceData);

    } catch (err) {

      console.error(
        'Failed to load reports:',
        err
      );


      const message =
        err.response?.data?.message ||
        'Failed to load reports';


      setError(message);

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // FILTER ATTENDANCE
  // =======================================================

  const filteredAttendance = useMemo(() => {

    if (
      !appliedStartDate ||
      !appliedEndDate
    ) {

      return [];

    }


    if (
      appliedStartDate >
      appliedEndDate
    ) {

      return [];

    }


    return attendance.filter(
      (record) => {

        if (!record.attendanceDate) {
          return false;
        }


        return (
          record.attendanceDate >=
            appliedStartDate &&
          record.attendanceDate <=
            appliedEndDate
        );

      }
    );

  }, [
    attendance,
    appliedStartDate,
    appliedEndDate,
  ]);


  // =======================================================
  // FILTER LEAVES
  // =======================================================

  const filteredLeaves = useMemo(() => {

    if (
      !appliedStartDate ||
      !appliedEndDate
    ) {

      return [];

    }


    if (
      appliedStartDate >
      appliedEndDate
    ) {

      return [];

    }


    return leaves.filter(
      (leave) => {

        if (
          !leave.startDate ||
          !leave.endDate
        ) {

          return false;

        }


        /*
         * Include a leave when it overlaps
         * with the selected date range.
         */

        return (
          leave.startDate <=
            appliedEndDate &&
          leave.endDate >=
            appliedStartDate
        );

      }
    );

  }, [
    leaves,
    appliedStartDate,
    appliedEndDate,
  ]);


  // =======================================================
  // BASIC STATISTICS
  // =======================================================

  const totalEmployees =
    employees.length;


  const totalAttendanceRecords =
    filteredAttendance.length;


  const presentDays = useMemo(
    () =>
      filteredAttendance.filter(
        (record) =>
          normalizeStatus(
            record.status
          ) === 'PRESENT'
      ).length,
    [filteredAttendance]
  );


  const absentDays = useMemo(
    () =>
      filteredAttendance.filter(
        (record) =>
          normalizeStatus(
            record.status
          ) === 'ABSENT'
      ).length,
    [filteredAttendance]
  );


  const halfDays = useMemo(
    () =>
      filteredAttendance.filter(
        (record) =>
          normalizeStatus(
            record.status
          ) === 'HALF_DAY'
      ).length,
    [filteredAttendance]
  );


  // =======================================================
  // LEAVE STATISTICS
  // =======================================================

  const totalLeaveRequests =
    filteredLeaves.length;


  const approvedLeaves = useMemo(
    () =>
      filteredLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.status
          ) === 'APPROVED'
      ).length,
    [filteredLeaves]
  );


  const pendingLeaves = useMemo(
    () =>
      filteredLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.status
          ) === 'PENDING'
      ).length,
    [filteredLeaves]
  );


  const rejectedLeaves = useMemo(
    () =>
      filteredLeaves.filter(
        (leave) =>
          normalizeStatus(
            leave.status
          ) === 'REJECTED'
      ).length,
    [filteredLeaves]
  );


  // =======================================================
  // LEAVE STATUS CHART DATA
  // =======================================================

  const leaveStatusData = useMemo(
    () => [

      {
        name: 'Approved',
        value: approvedLeaves,
        color: '#4CAF50',
      },

      {
        name: 'Pending',
        value: pendingLeaves,
        color: '#FF9800',
      },

      {
        name: 'Rejected',
        value: rejectedLeaves,
        color: '#F44336',
      },

    ],
    [
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
    ]
  );


  // =======================================================
  // DEPARTMENT STATISTICS
  // =======================================================

  const departmentStats = useMemo(() => {

    const result = [];


    employees.forEach(
      (employee) => {

        const department =
          employee.department ||
          'Other';


        const existing =
          result.find(
            (item) =>
              item.name === department
          );


        if (existing) {

          existing.count += 1;

        } else {

          result.push({

            name: department,

            count: 1,

          });

        }

      }
    );


    return result;

  }, [employees]);


  // =======================================================
  // EMPLOYEE SUMMARY
  // =======================================================

  const employeeStats = useMemo(() => {

    return employees.map(
      (employee) => {

        const employeeId =
          Number(employee.id);


        // -------------------------------------------------
        // Employee leaves
        // -------------------------------------------------

        const employeeLeaves =
          filteredLeaves.filter(
            (leave) => {

              const leaveEmployeeId =
                leave.employeeId ??
                leave.employee?.id;


              return (
                Number(
                  leaveEmployeeId
                ) === employeeId
              );

            }
          );


        // -------------------------------------------------
        // Employee attendance
        // -------------------------------------------------

        const employeeAttendance =
          filteredAttendance.filter(
            (record) => {

              const attendanceEmployeeId =
                record.employeeId ??
                record.employee?.id;


              return (
                Number(
                  attendanceEmployeeId
                ) === employeeId
              );

            }
          );


        // -------------------------------------------------
        // Status counts
        // -------------------------------------------------

        const present =
          employeeAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'PRESENT'
          ).length;


        const absent =
          employeeAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'ABSENT'
          ).length;


        const halfDay =
          employeeAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'HALF_DAY'
          ).length;


        const approvedEmployeeLeaves =
          employeeLeaves.filter(
            (leave) =>
              normalizeStatus(
                leave.status
              ) === 'APPROVED'
          ).length;


        return {

          ...employee,

          attendance:
            employeeAttendance.length,

          present,

          absent,

          halfDay,

          totalLeaves:
            employeeLeaves.length,

          approvedLeaves:
            approvedEmployeeLeaves,

        };

      }
    );

  }, [
    employees,
    filteredLeaves,
    filteredAttendance,
  ]);


  // =======================================================
  // ATTENDANCE TREND
  // =======================================================

  const trendData = useMemo(() => {

    const result = [];


    if (
      !appliedStartDate ||
      !appliedEndDate
    ) {

      return result;

    }


    if (
      appliedStartDate >
      appliedEndDate
    ) {

      return result;

    }


    /*
     * Use local date construction instead of
     * new Date("YYYY-MM-DD") to avoid timezone shifts.
     */

    const startParts =
      appliedStartDate.split('-');

    const endParts =
      appliedEndDate.split('-');


    const start =
      new Date(
        Number(startParts[0]),
        Number(startParts[1]) - 1,
        Number(startParts[2])
      );


    const end =
      new Date(
        Number(endParts[0]),
        Number(endParts[1]) - 1,
        Number(endParts[2])
      );


    for (
      let date = new Date(start);
      date <= end;
      date.setDate(
        date.getDate() + 1
      )
    ) {

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, '0');

      const day =
        String(
          date.getDate()
        ).padStart(2, '0');


      const dateString =
        `${year}-${month}-${day}`;


      const dayAttendance =
        filteredAttendance.filter(
          (record) =>
            record.attendanceDate ===
            dateString
        );


      result.push({

        date:
          date.toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'short',
            }
          ),

        present:
          dayAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'PRESENT'
          ).length,

        absent:
          dayAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'ABSENT'
          ).length,

        halfDay:
          dayAttendance.filter(
            (record) =>
              normalizeStatus(
                record.status
              ) === 'HALF_DAY'
          ).length,

      });

    }


    return result;

  }, [
    filteredAttendance,
    appliedStartDate,
    appliedEndDate,
  ]);


  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatDate = (date) => {

    if (!date) {
      return '-';
    }


    const parts =
      String(date).split('-');


    if (parts.length !== 3) {
      return date;
    }


    return (
      `${parts[2]}-${parts[1]}-${parts[0]}`
    );

  };


  // =======================================================
  // GET EMPLOYEE NAME
  // =======================================================

  const getEmployeeName = (
    record
  ) => {

    // -----------------------------------------------------
    // Direct nested employee
    // -----------------------------------------------------

    if (
      record.employee?.name
    ) {

      return record.employee.name;

    }


    // -----------------------------------------------------
    // Direct employeeName
    // -----------------------------------------------------

    if (
      record.employeeName
    ) {

      return record.employeeName;

    }


    // -----------------------------------------------------
    // Employee ID
    // -----------------------------------------------------

    const employeeId =
      record.employeeId ??
      record.employee?.id;


    if (
      employeeId === undefined ||
      employeeId === null
    ) {

      return 'Unknown';

    }


    // -----------------------------------------------------
    // Search employee list
    // -----------------------------------------------------

    const employee =
      employees.find(
        (emp) =>
          Number(emp.id) ===
          Number(employeeId)
      );


    return (
      employee?.name ||
      'Unknown'
    );

  };


  // =======================================================
  // FORMAT TIME
  // =======================================================

  const formatTime = (
    value
  ) => {

    if (!value) {
      return '-';
    }


    try {

      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return String(value);

      }


      return date.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );

    } catch {

      return String(value);

    }

  };


  // =======================================================
  // GENERATE PDF
  // =======================================================

  const generateReport = () => {

    // -----------------------------------------------------
    // Validate selected dates
    // -----------------------------------------------------

    if (
      !draftStartDate ||
      !draftEndDate
    ) {

      setError(
        'Please select both start date and end date.'
      );

      return;

    }


    if (
      draftStartDate >
      draftEndDate
    ) {

      setError(
        'End date cannot be before start date.'
      );

      return;

    }


    try {

      setGenerating(true);

      setError(null);


      // ---------------------------------------------------
      // IMPORTANT:
      //
      // Apply the selected dates to the dashboard.
      // ---------------------------------------------------

      setAppliedStartDate(
        draftStartDate
      );

      setAppliedEndDate(
        draftEndDate
      );


      // ---------------------------------------------------
      // IMPORTANT:
      //
      // Create PDF using the DRAFT dates directly.
      //
      // This prevents the PDF from using the previous
      // applied date state because React state updates
      // are asynchronous.
      // ---------------------------------------------------

      const reportStartDate =
        draftStartDate;

      const reportEndDate =
        draftEndDate;


      // ---------------------------------------------------
      // Calculate report data specifically for the
      // selected dates.
      // ---------------------------------------------------

      const reportAttendance =
        attendance.filter(
          (record) => {

            if (!record.attendanceDate) {
              return false;
            }


            return (
              record.attendanceDate >=
                reportStartDate &&
              record.attendanceDate <=
                reportEndDate
            );

          }
        );


      const reportLeaves =
        leaves.filter(
          (leave) => {

            if (
              !leave.startDate ||
              !leave.endDate
            ) {

              return false;

            }


            return (
              leave.startDate <=
                reportEndDate &&
              leave.endDate >=
                reportStartDate
            );

          }
        );


      // ---------------------------------------------------
      // Report statistics
      // ---------------------------------------------------

      const reportPresent =
        reportAttendance.filter(
          (record) =>
            normalizeStatus(
              record.status
            ) === 'PRESENT'
        ).length;


      const reportAbsent =
        reportAttendance.filter(
          (record) =>
            normalizeStatus(
              record.status
            ) === 'ABSENT'
        ).length;


      const reportHalfDay =
        reportAttendance.filter(
          (record) =>
            normalizeStatus(
              record.status
            ) === 'HALF_DAY'
        ).length;


      const reportApprovedLeaves =
        reportLeaves.filter(
          (leave) =>
            normalizeStatus(
              leave.status
            ) === 'APPROVED'
        ).length;


      const reportPendingLeaves =
        reportLeaves.filter(
          (leave) =>
            normalizeStatus(
              leave.status
            ) === 'PENDING'
        ).length;


      const reportRejectedLeaves =
        reportLeaves.filter(
          (leave) =>
            normalizeStatus(
              leave.status
            ) === 'REJECTED'
        ).length;


      // ===================================================
      // CREATE PDF
      // ===================================================

      const doc =
        new jsPDF(
          'p',
          'mm',
          'a4'
        );


      /*
       * IMPORTANT:
       *
       * Use pageSize.getWidth().
       *
       * NOT:
       *
       * doc.internal.getWidth()
       */

      const pageWidth =
        doc.internal.pageSize.getWidth();


      const pageHeight =
        doc.internal.pageSize.getHeight();


      // ===================================================
      // TITLE
      // ===================================================

      doc.setFontSize(20);

      doc.setFont(
        undefined,
        'bold'
      );


      doc.text(
        'Employee Attendance Report',
        pageWidth / 2,
        20,
        {
          align: 'center',
        }
      );


      doc.setFontSize(10);

      doc.setFont(
        undefined,
        'normal'
      );


      doc.text(
        `Period: ${formatDate(reportStartDate)} to ${formatDate(reportEndDate)}`,
        pageWidth / 2,
        28,
        {
          align: 'center',
        }
      );


      // ===================================================
      // REPORT SUMMARY
      // ===================================================

      doc.setFontSize(14);

      doc.setFont(
        undefined,
        'bold'
      );


      doc.text(
        'Report Summary',
        14,
        40
      );


      autoTable(
        doc,
        {

          startY: 45,

          head: [[
            'Metric',
            'Value',
          ]],

          body: [

            [
              'Total Employees',
              totalEmployees,
            ],

            [
              'Attendance Records',
              reportAttendance.length,
            ],

            [
              'Present',
              reportPresent,
            ],

            [
              'Absent',
              reportAbsent,
            ],

            [
              'Half Day',
              reportHalfDay,
            ],

            [
              'Total Leave Requests',
              reportLeaves.length,
            ],

            [
              'Approved Leaves',
              reportApprovedLeaves,
            ],

            [
              'Pending Leaves',
              reportPendingLeaves,
            ],

            [
              'Rejected Leaves',
              reportRejectedLeaves,
            ],

          ],

          theme: 'grid',

          styles: {
            fontSize: 10,
            cellPadding: 3,
          },

          headStyles: {
            fillColor: [
              0,
              102,
              204,
            ],
            textColor: 255,
            fontStyle: 'bold',
          },

        }
      );


      // ===================================================
      // EMPLOYEE SUMMARY
      // ===================================================

      doc.addPage();


      doc.setFontSize(14);

      doc.setFont(
        undefined,
        'bold'
      );


      doc.text(
        'Employee Summary',
        14,
        20
      );


      // ---------------------------------------------------
      // Calculate employee report statistics using the
      // selected dates.
      // ---------------------------------------------------

      const reportEmployeeStats =
        employees.map(
          (employee) => {

            const employeeId =
              Number(employee.id);


            const employeeAttendance =
              reportAttendance.filter(
                (record) => {

                  const id =
                    record.employeeId ??
                    record.employee?.id;


                  return (
                    Number(id) ===
                    employeeId
                  );

                }
              );


            const employeeLeaves =
              reportLeaves.filter(
                (leave) => {

                  const id =
                    leave.employeeId ??
                    leave.employee?.id;


                  return (
                    Number(id) ===
                    employeeId
                  );

                }
              );


            return {

              ...employee,

              attendance:
                employeeAttendance.length,

              present:
                employeeAttendance.filter(
                  (record) =>
                    normalizeStatus(
                      record.status
                    ) === 'PRESENT'
                ).length,

              absent:
                employeeAttendance.filter(
                  (record) =>
                    normalizeStatus(
                      record.status
                    ) === 'ABSENT'
                ).length,

              halfDay:
                employeeAttendance.filter(
                  (record) =>
                    normalizeStatus(
                      record.status
                    ) === 'HALF_DAY'
                ).length,

              totalLeaves:
                employeeLeaves.length,

              approvedLeaves:
                employeeLeaves.filter(
                  (leave) =>
                    normalizeStatus(
                      leave.status
                    ) === 'APPROVED'
                ).length,

            };

          }
        );


      autoTable(
        doc,
        {

          startY: 25,

          head: [[

            'Name',

            'Department',

            'Attendance',

            'Present',

            'Absent',

            'Half Day',

            'Leaves',

            'Approved',

          ]],

          body:
            reportEmployeeStats.map(
              (employee) => [

                employee.name ||
                  '-',

                employee.department ||
                  '-',

                employee.attendance,

                employee.present,

                employee.absent,

                employee.halfDay,

                employee.totalLeaves,

                employee.approvedLeaves,

              ]
            ),

          theme: 'grid',

          styles: {
            fontSize: 7,
            cellPadding: 2,
          },

          headStyles: {
            fillColor: [
              0,
              102,
              204,
            ],
            textColor: 255,
            fontStyle: 'bold',
          },

        }
      );


      // ===================================================
      // ATTENDANCE DETAILS
      // ===================================================

      doc.addPage();


      doc.setFontSize(14);

      doc.setFont(
        undefined,
        'bold'
      );


      doc.text(
        'Attendance Details',
        14,
        20
      );


      const attendanceRows =
        reportAttendance.map(
          (record) => [

            getEmployeeName(
              record
            ),

            formatDate(
              record.attendanceDate
            ),

            formatTime(
              record.checkInTime
            ),

            formatTime(
              record.checkOutTime
            ),

            normalizeStatus(
              record.status
            ) === 'HALF_DAY'
              ? 'HALF DAY'
              : (
                  record.status ||
                  '-'
                ),

          ]
        );


      autoTable(
        doc,
        {

          startY: 25,

          head: [[

            'Employee',

            'Date',

            'Check In',

            'Check Out',

            'Status',

          ]],

          body:
            attendanceRows.length > 0
              ? attendanceRows
              : [[
                  'No attendance records',
                  '-',
                  '-',
                  '-',
                  '-',
                ]],

          theme: 'grid',

          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },

          headStyles: {
            fillColor: [
              76,
              175,
              80,
            ],
            textColor: 255,
            fontStyle: 'bold',
          },

        }
      );


      // ===================================================
      // LEAVE DETAILS
      // ===================================================

      doc.addPage();


      doc.setFontSize(14);

      doc.setFont(
        undefined,
        'bold'
      );


      doc.text(
        'Leave Request Details',
        14,
        20
      );


      const leaveRows =
        reportLeaves.map(
          (leave) => [

            getEmployeeName(
              leave
            ),

            formatDate(
              leave.startDate
            ),

            formatDate(
              leave.endDate
            ),

            leave.reason ||
              '-',

            leave.status ||
              '-',

          ]
        );


      autoTable(
        doc,
        {

          startY: 25,

          head: [[

            'Employee',

            'Start Date',

            'End Date',

            'Reason',

            'Status',

          ]],

          body:
            leaveRows.length > 0
              ? leaveRows
              : [[
                  'No leave requests',
                  '-',
                  '-',
                  '-',
                  '-',
                ]],

          theme: 'grid',

          styles: {
            fontSize: 8,
            cellPadding: 2.5,
          },

          headStyles: {
            fillColor: [
              255,
              152,
              0,
            ],
            textColor: 255,
            fontStyle: 'bold',
          },

          columnStyles: {

            3: {
              cellWidth: 70,
            },

          },

        }
      );


      // ===================================================
      // FOOTER ON EVERY PAGE
      // ===================================================

      const pageCount =
        doc.internal.getNumberOfPages();


      for (
        let page = 1;
        page <= pageCount;
        page++
      ) {

        doc.setPage(page);


        doc.setFontSize(8);

        doc.setFont(
          undefined,
          'normal'
        );


        doc.text(
          `Employee Attendance System | Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: 'center',
          }
        );

      }


      // ===================================================
      // SAVE PDF
      // ===================================================

      const filename =
        `employee-attendance-report-${reportStartDate}-to-${reportEndDate}.pdf`;


      doc.save(filename);


    } catch (err) {

      console.error(
        'Report generation failed:',
        err
      );


      setError(
        `Failed to generate report: ${
          err?.message ||
          'Unknown error'
        }`
      );


    } finally {

      setGenerating(false);

    }

  };


  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading) {

    return (
      <Loading
        message="Loading reports..."
      />
    );

  }


  // =======================================================
  // UI
  // =======================================================

  return (

    <Box>

      {/* ===================================================
          HEADER
      =================================================== */}

      <Box mb={4}>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Reports & Analytics
        </Typography>


        <Typography
          variant="body1"
          color="textSecondary"
        >
          Comprehensive attendance and leave analysis
        </Typography>

      </Box>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <ErrorMessage
          message={error}
          onRetry={() => {
            setError(null);
            fetchReportData();
          }}
        />

      )}


      {/* ===================================================
          DATE FILTER
      =================================================== */}

      <Paper
        sx={{
          p: 3,
          mb: 4,
        }}
      >

        <Grid
          container
          spacing={2}
          alignItems="flex-end"
        >

          {/* START DATE */}

          <Grid
            item
            xs={12}
            sm={4}
          >

            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={draftStartDate}
              onChange={(event) => {

                /*
                 * IMPORTANT:
                 *
                 * Only update the input value.
                 *
                 * Do NOT fetch data here.
                 * Do NOT regenerate the report here.
                 */

                setDraftStartDate(
                  event.target.value
                );

              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: draftEndDate || undefined,
              }}
            />

          </Grid>


          {/* END DATE */}

          <Grid
            item
            xs={12}
            sm={4}
          >

            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={draftEndDate}
              onChange={(event) => {

                /*
                 * Only update the date input.
                 */

                setDraftEndDate(
                  event.target.value
                );

              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: draftStartDate || undefined,
              }}
            />

          </Grid>


          {/* GENERATE */}

          <Grid
            item
            xs={12}
            sm={4}
          >

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={generateReport}
              disabled={generating}
              sx={{
                height: 56,
              }}
            >

              {generating
                ? 'Generating...'
                : 'Generate Report'}

            </Button>

          </Grid>

        </Grid>

      </Paper>


      {/* ===================================================
          KEY METRICS
      =================================================== */}

      <Grid
        container
        spacing={3}
        mb={4}
      >

        {/* TOTAL EMPLOYEES */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={GroupIcon}
            color="primary"
          />

        </Grid>


        {/* TOTAL LEAVES */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <StatCard
            title="Total Leaves"
            value={totalLeaveRequests}
            icon={PieChartIcon}
            color="info"
          />

        </Grid>


        {/* APPROVED */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <StatCard
            title="Approved"
            value={approvedLeaves}
            icon={TrendingUpIcon}
            color="success"
          />

        </Grid>


        {/* PENDING */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >

          <StatCard
            title="Pending"
            value={pendingLeaves}
            icon={BarChartIcon}
            color="warning"
          />

        </Grid>

      </Grid>


      {/* ===================================================
          CHARTS
      =================================================== */}

      <Grid
        container
        spacing={3}
        mb={4}
      >

        {/* =================================================
            LEAVE STATUS
        ================================================= */}

        <Grid
          item
          xs={12}
          md={6}
        >

          <Card>

            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Leave Requests by Status
              </Typography>


              {totalLeaveRequests > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={leaveStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({
                        name,
                        value,
                      }) =>
                        `${name}: ${value}`
                      }
                      outerRadius={100}
                      dataKey="value"
                    >

                      {leaveStatusData.map(
                        (
                          entry,
                          index
                        ) => (

                          <Cell
                            key={
                              `cell-${index}`
                            }
                            fill={
                              entry.color
                            }
                          />

                        )
                      )}

                    </Pie>


                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <Typography
                  color="textSecondary"
                  align="center"
                  py={4}
                >
                  No leave data available
                </Typography>

              )}

            </CardContent>

          </Card>

        </Grid>


        {/* =================================================
            DEPARTMENT
        ================================================= */}

        <Grid
          item
          xs={12}
          md={6}
        >

          <Card>

            <CardContent>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Employees by Department
              </Typography>


              {departmentStats.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={departmentStats}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />


                    <XAxis
                      dataKey="name"
                    />


                    <YAxis />


                    <Tooltip />


                    <Bar
                      dataKey="count"
                      fill="#0066CC"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <Typography
                  color="textSecondary"
                  align="center"
                  py={4}
                >
                  No department data available
                </Typography>

              )}

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* ===================================================
          ATTENDANCE TREND
      =================================================== */}

      <Card
        sx={{
          mb: 4,
        }}
      >

        <CardContent>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Attendance Trend
          </Typography>


          {trendData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={trendData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />


                <XAxis
                  dataKey="date"
                />


                <YAxis />


                <Tooltip />


                <Legend />


                {/* PRESENT */}

                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#4CAF50"
                  name="Present"
                />


                {/* ABSENT */}

                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#F44336"
                  name="Absent"
                />


                {/* HALF DAY */}

                <Line
                  type="monotone"
                  dataKey="halfDay"
                  stroke="#FF9800"
                  name="Half Day"
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <Typography
              color="textSecondary"
              align="center"
              py={4}
            >
              No attendance data available
            </Typography>

          )}

        </CardContent>

      </Card>


      {/* ===================================================
          EMPLOYEE SUMMARY
      =================================================== */}

      <Card>

        <CardContent>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Employee Summary
          </Typography>


          {employeeStats.length > 0 ? (

            <TableContainer
              sx={{
                overflowX: 'auto',
              }}
            >

              <Table
                sx={{
                  minWidth: 1000,
                }}
              >

                <TableHead>

                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F5F7FA',
                    }}
                  >

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Name
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Department
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Email
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Attendance
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Present
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Absent
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Half Day
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Total Leaves
                    </TableCell>


                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Approved
                    </TableCell>

                  </TableRow>

                </TableHead>


                <TableBody>

                  {employeeStats.map(
                    (employee) => (

                      <TableRow
                        key={employee.id}
                        hover
                      >

                        {/* NAME */}

                        <TableCell
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {employee.name}
                        </TableCell>


                        {/* DEPARTMENT */}

                        <TableCell>
                          {
                            employee.department ||
                            'N/A'
                          }
                        </TableCell>


                        {/* EMAIL */}

                        <TableCell>
                          {employee.email}
                        </TableCell>


                        {/* ATTENDANCE */}

                        <TableCell
                          align="center"
                        >
                          {
                            employee.attendance
                          }
                        </TableCell>


                        {/* PRESENT */}

                        <TableCell
                          align="center"
                        >

                          <Typography
                            sx={{
                              color:
                                employee.present >
                                0
                                  ? '#4CAF50'
                                  : '#9E9E9E',
                            }}
                          >
                            {
                              employee.present
                            }
                          </Typography>

                        </TableCell>


                        {/* ABSENT */}

                        <TableCell
                          align="center"
                        >

                          <Typography
                            sx={{
                              color:
                                employee.absent >
                                0
                                  ? '#F44336'
                                  : '#9E9E9E',
                            }}
                          >
                            {
                              employee.absent
                            }
                          </Typography>

                        </TableCell>


                        {/* HALF DAY */}

                        <TableCell
                          align="center"
                        >

                          <Typography
                            sx={{
                              color:
                                employee.halfDay >
                                0
                                  ? '#FF9800'
                                  : '#9E9E9E',
                            }}
                          >
                            {
                              employee.halfDay
                            }
                          </Typography>

                        </TableCell>


                        {/* TOTAL LEAVES */}

                        <TableCell
                          align="center"
                        >
                          {
                            employee.totalLeaves
                          }
                        </TableCell>


                        {/* APPROVED */}

                        <TableCell
                          align="center"
                        >

                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                employee.approvedLeaves >
                                0
                                  ? '#4CAF50'
                                  : '#9E9E9E',
                            }}
                          >
                            {
                              employee.approvedLeaves
                            }
                          </Typography>

                        </TableCell>

                      </TableRow>

                    )
                  )}

                </TableBody>

              </Table>

            </TableContainer>

          ) : (

            <Typography
              color="textSecondary"
              align="center"
              py={4}
            >
              No employee data available
            </Typography>

          )}

        </CardContent>

      </Card>

    </Box>

  );

};


export default Reports;
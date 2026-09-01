import api from './axios';

export const attendanceApi = {

  // =========================================================
  // GET ALL ATTENDANCE - HR ONLY
  // =========================================================

  getAllAttendance: () => {
    return api.get('/attendance');
  },


  // =========================================================
  // CHECK-IN
  // =========================================================

  checkIn: (employeeId) => {
    return api.post(`/attendance/check-in/${employeeId}`);
  },


  // =========================================================
  // CHECK-OUT
  // =========================================================

  checkOut: (attendanceId) => {
    return api.put(`/attendance/check-out/${attendanceId}`);
  },


  // =========================================================
  // GET EMPLOYEE ATTENDANCE
  // =========================================================

  getEmployeeAttendance: (employeeId) => {
    return api.get(`/attendance/employee/${employeeId}`);
  },


  // =========================================================
  // GET EMPLOYEE ATTENDANCE BY DATE RANGE
  // =========================================================

  getEmployeeAttendanceByDateRange: (
    employeeId,
    startDate,
    endDate
  ) => {
    return api.get(
      `/attendance/employee/${employeeId}/range`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
  },


  // =========================================================
  // GET ATTENDANCE STATISTICS
  // =========================================================

  getAttendanceStatistics: (
    employeeId,
    startDate,
    endDate
  ) => {
    return api.get(
      `/attendance/employee/${employeeId}/statistics`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
  },
};

export default attendanceApi;
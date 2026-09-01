import React, { useEffect, useState } from 'react';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useAuth } from '../../context/AuthContext';

import attendanceApi from '../../api/attendanceApi';
import employeeApi from '../../api/employeeApi';
import leaveApi from '../../api/leaveApi';

import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [leaves, setLeaves] = useState([]);

  const [checkInOut, setCheckInOut] = useState({
    loading: false,
    error: null,
  });

  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // =========================================================
  // GET LOCAL DATE
  // =========================================================

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    if (user?.employeeId) {
      fetchDashboardData();
    }
  }, [user?.employeeId]);

  const fetchDashboardData = async () => {
    if (!user?.employeeId) {
      setError('Employee information is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const employeeId = user.employeeId;

      // -----------------------------------------------------
      // Current month date range
      // -----------------------------------------------------

      const now = new Date();

      const year = now.getFullYear();
      const month = now.getMonth();

      const startDate = getLocalDateString(
        new Date(year, month, 1)
      );

      const endDate = getLocalDateString(
        new Date(year, month + 1, 0)
      );

      // -----------------------------------------------------
      // Load dashboard data
      // -----------------------------------------------------

      const [
        profileResult,
        attendanceResult,
        statisticsResult,
        leavesResult,
      ] = await Promise.allSettled([
        employeeApi.getMyProfile(),

        attendanceApi.getEmployeeAttendance(
          employeeId
        ),

        attendanceApi.getAttendanceStatistics(
          employeeId,
          startDate,
          endDate
        ),

        leaveApi.getMyLeaves(),
      ]);

      // -----------------------------------------------------
      // PROFILE
      // -----------------------------------------------------

      if (profileResult.status === 'fulfilled') {
        setProfile(
          profileResult.value.data
        );
      } else {
        console.error(
          'Profile request failed:',
          profileResult.reason
        );
      }

      // -----------------------------------------------------
      // ATTENDANCE
      // -----------------------------------------------------

      if (attendanceResult.status === 'fulfilled') {
        setAttendance(
          attendanceResult.value.data || []
        );
      } else {
        console.error(
          'Attendance request failed:',
          attendanceResult.reason
        );
      }

      // -----------------------------------------------------
      // STATISTICS
      // -----------------------------------------------------

      if (statisticsResult.status === 'fulfilled') {
        setStatistics(
          statisticsResult.value.data
        );
      } else {
        console.error(
          'Statistics request failed:',
          statisticsResult.reason
        );
      }

      // -----------------------------------------------------
      // LEAVES
      // -----------------------------------------------------

      if (leavesResult.status === 'fulfilled') {
        setLeaves(
          leavesResult.value.data || []
        );
      } else {
        console.error(
          'Leaves request failed:',
          leavesResult.reason
        );
      }

      // -----------------------------------------------------
      // Check whether requests failed
      // -----------------------------------------------------

      const failedRequests = [
        profileResult,
        attendanceResult,
        statisticsResult,
        leavesResult,
      ].filter(
        (result) =>
          result.status === 'rejected'
      );

      if (failedRequests.length > 0) {
        setError(
          'Some dashboard data could not be loaded.'
        );
      }

    } catch (err) {
      console.error(
        'Dashboard error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load dashboard data'
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TODAY'S ATTENDANCE
  // =========================================================

  const getTodayAttendance = () => {
    const today = getLocalDateString();

    return attendance.find(
      (record) =>
        record.attendanceDate === today
    );
  };

  // =========================================================
  // TODAY STATUS
  // =========================================================

  const getTodayStatus = () => {
    const today =
      getTodayAttendance();

    if (!today) {
      return 'Not Checked In';
    }

    if (!today.checkOutTime) {
      return 'Checked In';
    }

    return 'Completed';
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return 'N/A';
    }

    return new Date(
      dateTime
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // CHECK-IN TIME
  // =========================================================

  const getCheckInTime = () => {
    const today =
      getTodayAttendance();

    return formatTime(
      today?.checkInTime
    );
  };

  // =========================================================
  // CHECK-OUT TIME
  // =========================================================

  const getCheckOutTime = () => {
    const today =
      getTodayAttendance();

    return formatTime(
      today?.checkOutTime
    );
  };

  // =========================================================
  // CALCULATE WORKING HOURS
  // =========================================================

  const calculateWorkingHours = () => {
    const today =
      getTodayAttendance();

    if (
      !today?.checkInTime ||
      !today?.checkOutTime
    ) {
      return 'N/A';
    }

    const checkIn =
      new Date(today.checkInTime);

    const checkOut =
      new Date(today.checkOutTime);

    const hours =
      (checkOut - checkIn) /
      (1000 * 60 * 60);

    return hours.toFixed(1);
  };

  // =========================================================
  // CHECK-IN
  // =========================================================

  const handleCheckIn = async () => {
    if (!user?.employeeId) {
      return;
    }

    try {
      setCheckInOut({
        loading: true,
        error: null,
      });

      await attendanceApi.checkIn(
        user.employeeId
      );

      setSnackbar({
        open: true,
        message: 'Check-in successful! Have a productive day.',
        severity: 'success',
      });

      await fetchDashboardData();

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Check-in failed. Please try again.';

      setCheckInOut({
        loading: false,
        error: message,
      });

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });

    } finally {
      setCheckInOut((previous) => ({
        ...previous,
        loading: false,
      }));
    }
  };

  // =========================================================
  // OPEN CHECK-OUT DIALOG
  // =========================================================

  const openCheckOutDialog = (
    attendanceId
  ) => {
    if (!attendanceId) {
      return;
    }

    setSelectedAttendanceId(
      attendanceId
    );

    setCheckOutDialogOpen(true);
  };

  // =========================================================
  // CLOSE CHECK-OUT DIALOG
  // =========================================================

  const closeCheckOutDialog = () => {
    if (checkInOut.loading) {
      return;
    }

    setCheckOutDialogOpen(false);
    setSelectedAttendanceId(null);
  };

  // =========================================================
  // CHECK-OUT
  // =========================================================

  const handleCheckOut = async () => {
    if (!selectedAttendanceId) {
      return;
    }

    try {
      setCheckInOut({
        loading: true,
        error: null,
      });

      await attendanceApi.checkOut(
        selectedAttendanceId
      );

      setSnackbar({
        open: true,
        message: 'Check-out successful! Your attendance has been completed.',
        severity: 'success',
      });

      setCheckOutDialogOpen(false);
      setSelectedAttendanceId(null);

      await fetchDashboardData();

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Check-out failed. Please try again.';

      setCheckInOut({
        loading: false,
        error: message,
      });

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });

    } finally {
      setCheckInOut((previous) => ({
        ...previous,
        loading: false,
      }));
    }
  };

  // =========================================================
  // RECENT ATTENDANCE
  // =========================================================

  const getRecentAttendance = () => {
    return [...attendance]
      .sort(
        (a, b) =>
          new Date(b.attendanceDate) -
          new Date(a.attendanceDate)
      )
      .slice(0, 7);
  };

  // =========================================================
  // CHART DATA
  // =========================================================

  const getChartData = () => {
    return [...getRecentAttendance()]
      .reverse()
      .map((record) => {
        const checkIn =
          record.checkInTime
            ? new Date(
                record.checkInTime
              )
            : null;

        const checkOut =
          record.checkOutTime
            ? new Date(
                record.checkOutTime
              )
            : null;

        const hours =
          checkIn && checkOut
            ? (checkOut - checkIn) /
              (1000 * 60 * 60)
            : 0;

        return {
          date: new Date(
            `${record.attendanceDate}T00:00:00`
          ).toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
            }
          ),

          hours: Number(
            hours.toFixed(1)
          ),
        };
      });
  };

  // =========================================================
  // LEAVE BALANCE
  // =========================================================

  const getLeaveBalance = () => {
    return profile?.leaveBalance ?? 0;
  };

  // =========================================================
  // APPROVED LEAVE DAYS
  // =========================================================

  const getApprovedLeaveDays = () => {
    return leaves
      .filter(
        (leave) =>
          leave.status === 'APPROVED'
      )
      .reduce((total, leave) => {
        if (
          !leave.startDate ||
          !leave.endDate
        ) {
          return total;
        }

        const start =
          new Date(
            `${leave.startDate}T00:00:00`
          );

        const end =
          new Date(
            `${leave.endDate}T00:00:00`
          );

        const days =
          Math.floor(
            (end - start) /
              (1000 * 60 * 60 * 24)
          ) + 1;

        return total + days;

      }, 0);
  };

  // =========================================================
  // LEAVE PIE DATA
  // =========================================================

  const getLeavePieData = () => {
    const used =
      getApprovedLeaveDays();

    const remaining = Math.max(
      0,
      getLeaveBalance()
    );

    return [
      {
        name: 'Used',
        value: used,
        color: '#F44336',
      },
      {
        name: 'Remaining',
        value: remaining,
        color: '#4CAF50',
      },
    ];
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Loading
        message="Loading dashboard..."
      />
    );
  }

  const today =
    getTodayAttendance();

  const todayStatus =
    getTodayStatus();

  const chartData =
    getChartData();

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box mb={4}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Here's what's happening with your attendance today.
        </Typography>
      </Box>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Box mb={3}>
          <ErrorMessage
            message={error}
            onRetry={fetchDashboardData}
          />
        </Box>
      )}

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <Grid
        container
        spacing={3}
        mb={4}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Today's Status"
            value={todayStatus}
            icon={DashboardIcon}
            color="primary"
            subtext={
              todayStatus === 'Completed'
                ? 'All good'
                : todayStatus === 'Checked In'
                  ? 'Currently working'
                  : 'Ready to check in'
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Check-in Time"
            value={getCheckInTime()}
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Today's Hours"
            value={calculateWorkingHours()}
            icon={AccessTimeIcon}
            color="info"
            subtext="hours worked"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="This Month"
            value={
              statistics?.presentDays ?? 0
            }
            icon={CalendarTodayIcon}
            color="warning"
            subtext="days present"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Leave Balance"
            value={getLeaveBalance()}
            icon={FlightTakeoffIcon}
            color="error"
            subtext="days available"
          />
        </Grid>

      </Grid>

      {/* =====================================================
          TODAY'S ATTENDANCE ACTION
      ===================================================== */}

      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Today's Attendance
          </Typography>

          {/* -------------------------------------------------
              NOT CHECKED IN
          ------------------------------------------------- */}

          {!today && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                justifyContent: 'space-between',
                gap: 2,
                p: 2.5,
                borderRadius: 2,
                backgroundColor: '#E3F2FD',
                borderLeft: '4px solid #1976D2',
              }}
            >

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  You haven't checked in today.
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Start your workday by checking in.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  checkInOut.loading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <LoginIcon />
                  )
                }
                disabled={checkInOut.loading}
                onClick={handleCheckIn}
                sx={{
                  minWidth: {
                    xs: '100%',
                    sm: 150,
                  },
                  fontWeight: 600,
                  py: 1.3,
                }}
              >
                {checkInOut.loading
                  ? 'Checking In...'
                  : 'Check In'}
              </Button>

            </Box>
          )}

          {/* -------------------------------------------------
              CHECKED IN - WAITING FOR CHECKOUT
          ------------------------------------------------- */}

          {today &&
            !today.checkOutTime && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: '#FFF8E1',
                  borderLeft: '4px solid #FF9800',
                }}
              >

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: {
                      xs: 'column',
                      sm: 'row',
                    },
                    justifyContent: 'space-between',
                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },
                    gap: 3,
                  }}
                >

                  <Box>

                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      You are currently checked in.
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Check-in time:{' '}
                      <strong>
                        {getCheckInTime()}
                      </strong>
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Don't forget to check out when you finish work.
                    </Typography>

                  </Box>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={
                      checkInOut.loading ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <LogoutIcon />
                      )
                    }
                    disabled={
                      checkInOut.loading
                    }
                    onClick={() =>
                      openCheckOutDialog(
                        today.id
                      )
                    }
                    sx={{
                      minWidth: {
                        xs: '100%',
                        sm: 150,
                      },
                      fontWeight: 600,
                      py: 1.3,
                    }}
                  >
                    {checkInOut.loading
                      ? 'Checking Out...'
                      : 'Check Out'}
                  </Button>

                </Box>

              </Box>
            )}

          {/* -------------------------------------------------
              COMPLETED
          ------------------------------------------------- */}

          {today &&
            today.checkOutTime && (
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{
                  borderRadius: 2,
                  alignItems: 'center',
                }}
              >

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Attendance completed for today.
                </Typography>

                <Typography variant="body2">
                  Check-in:{' '}
                  <strong>
                    {getCheckInTime()}
                  </strong>

                  {'  |  '}

                  Check-out:{' '}
                  <strong>
                    {getCheckOutTime()}
                  </strong>

                  {'  |  '}

                  Working hours:{' '}
                  <strong>
                    {calculateWorkingHours()}h
                  </strong>
                </Typography>

              </Alert>
            )}

          {/* -------------------------------------------------
              ACTION ERROR
          ------------------------------------------------- */}

          {checkInOut.error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {checkInOut.error}
            </Alert>
          )}

        </CardContent>
      </Card>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <Grid
        container
        spacing={3}
      >

        {/* Attendance Chart */}

        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
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
                Attendance Overview
              </Typography>

              {chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <BarChart
                    data={chartData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis
                      label={{
                        value: 'Hours',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="hours"
                      name="Working Hours"
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
                  color="text.secondary"
                  align="center"
                  py={8}
                >
                  No attendance data available.
                </Typography>
              )}

            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
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
                Leave Balance
              </Typography>

              <ResponsiveContainer
                width="100%"
                height={250}
              >
                <PieChart>

                  <Pie
                    data={getLeavePieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getLeavePieData().map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>

              <Box
                mt={2}
                textAlign="center"
              >

                <Typography
                  variant="body2"
                  display="block"
                >
                  Used:{' '}
                  <strong>
                    {getApprovedLeaveDays()}
                  </strong>{' '}
                  days
                </Typography>

                <Typography
                  variant="body2"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Remaining:{' '}
                  <strong>
                    {getLeaveBalance()}
                  </strong>{' '}
                  days
                </Typography>

              </Box>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* =====================================================
          RECENT ATTENDANCE
      ===================================================== */}

      <Card sx={{ mt: 4 }}>

        <CardContent>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Recent Attendance
          </Typography>

          <TableContainer>

            <Table>

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
                    Date
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Check In
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Check Out
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Hours
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Status
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {getRecentAttendance().map(
                  (record) => {

                    const checkIn =
                      record.checkInTime
                        ? new Date(
                            record.checkInTime
                          )
                        : null;

                    const checkOut =
                      record.checkOutTime
                        ? new Date(
                            record.checkOutTime
                          )
                        : null;

                    const hours =
                      checkIn &&
                      checkOut
                        ? (
                            checkOut -
                            checkIn
                          ) /
                          (1000 *
                            60 *
                            60)
                        : 0;

                    return (
                      <TableRow
                        key={record.id}
                        hover
                      >

                        <TableCell>
                          {new Date(
                            `${record.attendanceDate}T00:00:00`
                          ).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          {formatTime(
                            record.checkInTime
                          )}
                        </TableCell>

                        <TableCell>
                          {formatTime(
                            record.checkOutTime
                          )}
                        </TableCell>

                        <TableCell>
                          {checkIn &&
                          checkOut
                            ? `${hours.toFixed(1)}h`
                            : 'In progress'}
                        </TableCell>

                        <TableCell>
                          <StatusChip
                            status={
                              record.status
                            }
                          />
                        </TableCell>

                      </TableRow>
                    );
                  }
                )}

                {getRecentAttendance()
                  .length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                    >
                      <Typography
                        color="text.secondary"
                        py={4}
                      >
                        No attendance records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>

            </Table>

          </TableContainer>

        </CardContent>

      </Card>

      {/* =====================================================
          CHECK-OUT CONFIRMATION DIALOG
      ===================================================== */}

      <Dialog
        open={checkOutDialogOpen}
        onClose={closeCheckOutDialog}
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Confirm Check-out
        </DialogTitle>

        <DialogContent>

          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Are you sure you want to check out now?
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Check-in time
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              {getCheckInTime()}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Check-out time
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
              }}
            >
              {new Date().toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </Typography>
          </Box>

        </DialogContent>

        <DialogActions
          sx={{ p: 2 }}
        >

          <Button
            onClick={closeCheckOutDialog}
            disabled={
              checkInOut.loading
            }
          >
            Cancel
          </Button>

          <Button
            onClick={handleCheckOut}
            variant="contained"
            color="error"
            disabled={
              checkInOut.loading
            }
            startIcon={
              checkInOut.loading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <LogoutIcon />
              )
            }
          >
            {checkInOut.loading
              ? 'Checking Out...'
              : 'Confirm Check-out'}
          </Button>

        </DialogActions>

      </Dialog>

      {/* =====================================================
          SNACKBAR
      ===================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >

        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
          sx={{
            width: '100%',
          }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
};

export default EmployeeDashboard;
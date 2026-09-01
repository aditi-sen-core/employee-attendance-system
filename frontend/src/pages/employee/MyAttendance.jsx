import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import attendanceApi from '../../api/attendanceApi';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const MyAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]
  );

  useEffect(() => {
    fetchAttendance();
  }, [user?.employeeId, startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const [attendanceRes, statsRes] = await Promise.all([
        attendanceApi.getEmployeeAttendanceByDateRange(
          user.employeeId,
          startDate,
          endDate
        ),
        attendanceApi.getAttendanceStatistics(user.employeeId, startDate, endDate),
      ]);

      setAttendance(attendanceRes.data || []);
      setStatistics(statsRes.data);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load attendance data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading attendance data..." />;
  }

  const sortedAttendance = [...attendance].sort(
    (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate)
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          My Attendance
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage your attendance records
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchAttendance} />
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Days"
            value={statistics?.totalDays || 0}
            icon={CalendarTodayIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Days"
            value={statistics?.presentDays || 0}
            icon={AssignmentTurnedInIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Working Hours"
            value={`${(statistics?.totalHoursWorked || 0).toFixed(1)}h`}
            icon={AccessTimeIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average per Day"
            value={`${statistics?.totalDays > 0 ? ((statistics?.totalHoursWorked || 0) / statistics.totalDays).toFixed(1) : 0}h`}
            icon={AccessTimeIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Date Range Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchAttendance}
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Attendance Records
          </Typography>
          {sortedAttendance.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Working Hours</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAttendance.map((a, idx) => {
                    const checkIn = a.checkInTime
                      ? new Date(a.checkInTime)
                      : null;
                    const checkOut = a.checkOutTime
                      ? new Date(a.checkOutTime)
                      : null;
                    const hours =
                      checkIn && checkOut
                        ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(1)
                        : 0;

                    return (
                      <TableRow key={idx} hover>
                        <TableCell>
                          {new Date(a.attendanceDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {checkIn
                            ? checkIn.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {checkOut
                            ? checkOut.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{hours}h</TableCell>
                        <TableCell>
                          <StatusChip status={a.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" py={4}>
              No attendance records found for the selected date range.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyAttendance;

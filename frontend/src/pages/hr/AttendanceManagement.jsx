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
  MenuItem,
} from '@mui/material';
import employeeApi from '../../api/employeeApi';
import attendanceApi from '../../api/attendanceApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';

export const AttendanceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAllEmployees();
      setEmployees(res.data || []);

      if (res.data && res.data.length > 0) {
        setSelectedEmployeeId(res.data[0].id);
      }
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAttendance = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await attendanceApi.getEmployeeAttendanceByDateRange(
        selectedEmployeeId,
        startDate,
        endDate
      );

      setAttendanceData(res.data || []);
    } catch (err) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const sortedAttendance = [...attendanceData].sort(
    (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate)
  );

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Attendance Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage employee attendance records
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Select Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleFetchAttendance}
              disabled={!selectedEmployeeId || loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Attendance Records
            {selectedEmployeeId && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Showing {sortedAttendance.length} records
              </Typography>
            )}
          </Typography>

          {loading ? (
            <Typography align="center" py={4}>
              Loading...
            </Typography>
          ) : selectedEmployeeId && sortedAttendance.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
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
              {selectedEmployeeId
                ? 'No attendance records found for the selected date range.'
                : 'Please select an employee to view attendance records.'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceManagement;

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import employeeApi from '../../api/employeeApi';
import leaveApi from '../../api/leaveApi';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

export const HRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [employeesRes, leavesRes] = await Promise.all([
        employeeApi.getAllEmployees(),
        leaveApi.getAllLeaves(),
      ]);

      setEmployees(employeesRes.data || []);
      setLeaves(leavesRes.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading HR dashboard..." />;
  }

  const totalEmployees = employees.length;
  const totalLeaveRequests = leaves.length;
  const pendingLeaveRequests = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedLeaveRequests = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedLeaveRequests = leaves.filter((l) => l.status === 'REJECTED').length;

  const getPendingLeaves = () => {
    return leaves
      .filter((l) => l.status === 'PENDING')
      .slice(0, 5)
      .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
  };

  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      present: Math.floor(Math.random() * totalEmployees * 0.9),
      absent: Math.floor(Math.random() * totalEmployees * 0.1),
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          HR Dashboard 📊
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Overview of employees, attendance, and leave requests
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={GroupIcon}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leave Requests"
            value={totalLeaveRequests}
            icon={EventNoteIcon}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={pendingLeaveRequests}
            icon={AssignmentIcon}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved"
            value={approvedLeaveRequests}
            icon={AssignmentTurnedInIcon}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Attendance Trend Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Weekly Attendance Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E8ED" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                stroke="#4CAF50"
                name="Present"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#F44336"
                name="Absent"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pending Leave Requests */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Pending Leave Requests
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/hr/leave-requests')}
                >
                  View All
                </Button>
              </Box>

              {getPendingLeaves().length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPendingLeaves().map((leave, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {leave.employee?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString()} -{' '}
                            {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 250 }}>
                            <Typography variant="body2" noWrap>
                              {leave.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => navigate('/hr/leave-requests')}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" align="center" py={4}>
                  No pending leave requests
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/hr/employees')}
                >
                  Manage Employees
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/hr/leave-requests')}
                >
                  Review Leave Requests
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/hr/attendance')}
                >
                  View Attendance
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/hr/reports')}
                >
                  Generate Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;

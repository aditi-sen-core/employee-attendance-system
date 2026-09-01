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
  Chip,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import leaveApi from '../../api/leaveApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export const MyLeaves = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchLeaves();
  }, [user?.employeeId]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await leaveApi.getMyLeaves();
      setLeaves(res.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load leave records';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your leave requests..." />;
  }

  const sortedLeaves = [...leaves].sort(
    (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
  );

  const filteredLeaves =
    filterStatus === 'ALL'
      ? sortedLeaves
      : sortedLeaves.filter((l) => l.status === filterStatus);

  const getLeaveStats = () => {
    return {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === 'PENDING').length,
      approved: leaves.filter((l) => l.status === 'APPROVED').length,
      rejected: leaves.filter((l) => l.status === 'REJECTED').length,
    };
  };

  const stats = getLeaveStats();

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          My Leave Requests
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View all your leave applications and their status
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchLeaves} />
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 32, color: '#0066CC', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <HourglassEmptyIcon sx={{ fontSize: 32, color: '#FF9800', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {stats.approved}
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 32, color: '#4CAF50', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336' }}>
                    {stats.rejected}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 32, color: '#F44336', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box mb={3}>
        <Box display="flex" gap={1} flexWrap="wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setFilterStatus(status)}
              size="small"
            >
              {status === 'ALL' ? 'All Requests' : status}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Leaves Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Leave Request History
          </Typography>
          {filteredLeaves.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Applied On</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.map((leave, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        {new Date(leave.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {calculateLeaveDays(leave.startDate, leave.endDate)} days
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap title={leave.reason}>
                          {leave.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(leave.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={leave.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" py={4}>
              No leave requests found.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyLeaves;

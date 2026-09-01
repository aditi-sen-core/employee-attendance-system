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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';

import leaveApi from '../../api/leaveApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusChip from '../../components/common/StatusChip';

export const LeaveRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leaves, setLeaves] = useState([]);

  const [filterStatus, setFilterStatus] = useState('PENDING');

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [reviewingId, setReviewingId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // =========================================================
  // FETCH LEAVE REQUESTS
  // =========================================================

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await leaveApi.getAllLeaves();

      setLeaves(res.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to load leave requests';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET EMPLOYEE NAME
  // =========================================================

  const getEmployeeName = (leave) => {
    // Case 1:
    // Backend directly returns employeeName
    if (leave?.employeeName) {
      return leave.employeeName;
    }

    // Case 2:
    // Backend returns employee object with name
    if (leave?.employee?.name) {
      return leave.employee.name;
    }

    // Case 3:
    // Backend returns firstName + lastName
    if (
      leave?.employee?.firstName ||
      leave?.employee?.lastName
    ) {
      return `${leave.employee?.firstName || ''} ${
        leave.employee?.lastName || ''
      }`.trim();
    }

    // Case 4:
    // At least show email if available
    if (leave?.employee?.email) {
      return leave.employee.email;
    }

    // Case 5:
    // Prevent blank table cells
    return 'Unknown Employee';
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  // =========================================================
  // APPROVE LEAVE
  // =========================================================

  const handleApprove = async (id) => {
    try {
      setReviewingId(id);

      await leaveApi.approveLeave(id);

      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === id
            ? {
                ...leave,
                status: 'APPROVED',
              }
            : leave
        )
      );

      setSnackbar({
        open: true,
        message: 'Leave request approved! ✅',
        severity: 'success',
      });

      setDetailsDialogOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to approve leave';

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setReviewingId(null);
    }
  };

  // =========================================================
  // REJECT LEAVE
  // =========================================================

  const handleReject = async (id) => {
    try {
      setReviewingId(id);

      await leaveApi.rejectLeave(id);

      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === id
            ? {
                ...leave,
                status: 'REJECTED',
              }
            : leave
        )
      );

      setSnackbar({
        open: true,
        message: 'Leave request rejected! ❌',
        severity: 'success',
      });

      setDetailsDialogOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to reject leave';

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setReviewingId(null);
    }
  };

  // =========================================================
  // CALCULATE LEAVE DAYS
  // =========================================================

  const calculateLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return (
      Math.ceil(
        (end - start) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const getStats = () => {
    return {
      pending: leaves.filter(
        (leave) => leave.status === 'PENDING'
      ).length,

      approved: leaves.filter(
        (leave) => leave.status === 'APPROVED'
      ).length,

      rejected: leaves.filter(
        (leave) => leave.status === 'REJECTED'
      ).length,
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Loading message="Loading leave requests..." />
    );
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeaves =
    filterStatus === 'ALL'
      ? leaves
      : leaves.filter(
          (leave) =>
            leave.status === filterStatus
        );

  // =========================================================
  // SORT
  // =========================================================

  const sortedLeaves = [...filteredLeaves].sort(
    (a, b) =>
      new Date(b.appliedAt) -
      new Date(a.appliedAt)
  );

  const stats = getStats();

  // =========================================================
  // RENDER
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
          Leave Requests
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
        >
          Review and manage employee leave requests
        </Typography>
      </Box>


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchLeaves}
        />
      )}


      {/* =====================================================
          FILTER CHIPS
      ===================================================== */}

      <Box
        mb={4}
        display="flex"
        gap={2}
        flexWrap="wrap"
      >

        <Chip
          label={`Pending: ${stats.pending}`}
          color={
            filterStatus === 'PENDING'
              ? 'primary'
              : 'default'
          }
          onClick={() =>
            setFilterStatus('PENDING')
          }
          variant={
            filterStatus === 'PENDING'
              ? 'filled'
              : 'outlined'
          }
        />

        <Chip
          label={`Approved: ${stats.approved}`}
          color={
            filterStatus === 'APPROVED'
              ? 'primary'
              : 'default'
          }
          onClick={() =>
            setFilterStatus('APPROVED')
          }
          variant={
            filterStatus === 'APPROVED'
              ? 'filled'
              : 'outlined'
          }
        />

        <Chip
          label={`Rejected: ${stats.rejected}`}
          color={
            filterStatus === 'REJECTED'
              ? 'primary'
              : 'default'
          }
          onClick={() =>
            setFilterStatus('REJECTED')
          }
          variant={
            filterStatus === 'REJECTED'
              ? 'filled'
              : 'outlined'
          }
        />

        <Chip
          label="All"
          color={
            filterStatus === 'ALL'
              ? 'primary'
              : 'default'
          }
          onClick={() =>
            setFilterStatus('ALL')
          }
          variant={
            filterStatus === 'ALL'
              ? 'filled'
              : 'outlined'
          }
        />

      </Box>


      {/* =====================================================
          LEAVE REQUEST TABLE
      ===================================================== */}

      <Card>
        <CardContent>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Leave Request History
          </Typography>


          {sortedLeaves.length > 0 ? (

            <TableContainer>

              <Table>

                {/* TABLE HEADER */}

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
                      Employee
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Period
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Days
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Reason
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Applied On
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      Action
                    </TableCell>

                  </TableRow>

                </TableHead>


                {/* TABLE BODY */}

                <TableBody>

                  {sortedLeaves.map((leave) => (

                    <TableRow
                      key={leave.id}
                      hover
                    >

                      {/* EMPLOYEE */}

                      <TableCell
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {getEmployeeName(leave)}
                      </TableCell>


                      {/* PERIOD */}

                      <TableCell>

                        {new Date(
                          leave.startDate
                        ).toLocaleDateString()}

                        {' - '}

                        {new Date(
                          leave.endDate
                        ).toLocaleDateString()}

                      </TableCell>


                      {/* DAYS */}

                      <TableCell>

                        {calculateLeaveDays(
                          leave.startDate,
                          leave.endDate
                        )}{' '}
                        days

                      </TableCell>


                      {/* REASON */}

                      <TableCell
                        sx={{
                          maxWidth: 200,
                        }}
                      >

                        <Typography
                          variant="body2"
                          noWrap
                          title={leave.reason}
                        >
                          {leave.reason}
                        </Typography>

                      </TableCell>


                      {/* APPLIED ON */}

                      <TableCell>

                        {leave.appliedAt
                          ? new Date(
                              leave.appliedAt
                            ).toLocaleDateString()
                          : 'N/A'}

                      </TableCell>


                      {/* STATUS */}

                      <TableCell>

                        <StatusChip
                          status={leave.status}
                        />

                      </TableCell>


                      {/* ACTION */}

                      <TableCell align="center">

                        {leave.status ===
                        'PENDING' ? (

                          <Box
                            display="flex"
                            gap={0.5}
                            justifyContent="center"
                          >

                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                handleApprove(
                                  leave.id
                                )
                              }
                              disabled={
                                reviewingId ===
                                leave.id
                              }
                            >
                              Approve
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleReject(
                                  leave.id
                                )
                              }
                              disabled={
                                reviewingId ===
                                leave.id
                              }
                            >
                              Reject
                            </Button>

                          </Box>

                        ) : (

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleViewDetails(
                                leave
                              )
                            }
                          >
                            View
                          </Button>

                        )}

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            </TableContainer>

          ) : (

            <Typography
              color="textSecondary"
              align="center"
              py={4}
            >
              No leave requests found.
            </Typography>

          )}

        </CardContent>
      </Card>


      {/* =====================================================
          DETAILS DIALOG
      ===================================================== */}

      <Dialog
        open={detailsDialogOpen}
        onClose={() =>
          setDetailsDialogOpen(false)
        }
        maxWidth="sm"
        fullWidth
      >

        <DialogTitle>
          Leave Request Details
        </DialogTitle>

        <DialogContent>

          {selectedLeave && (

            <Box sx={{ mt: 2 }}>

              {/* EMPLOYEE */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Employee
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                {getEmployeeName(
                  selectedLeave
                )}
              </Typography>


              {/* PERIOD */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Period
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 2 }}
              >

                {new Date(
                  selectedLeave.startDate
                ).toLocaleDateString()}

                {' - '}

                {new Date(
                  selectedLeave.endDate
                ).toLocaleDateString()}

              </Typography>


              {/* NUMBER OF DAYS */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Number of Days
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 2 }}
              >

                {calculateLeaveDays(
                  selectedLeave.startDate,
                  selectedLeave.endDate
                )}{' '}
                days

              </Typography>


              {/* REASON */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Reason
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 2 }}
              >
                {selectedLeave.reason}
              </Typography>


              {/* APPLIED ON */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Applied On
              </Typography>

              <Typography
                variant="body1"
                sx={{ mb: 2 }}
              >

                {selectedLeave.appliedAt
                  ? new Date(
                      selectedLeave.appliedAt
                    ).toLocaleDateString()
                  : 'N/A'}

              </Typography>


              {/* STATUS */}

              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Status
              </Typography>

              <Box mb={2}>

                <StatusChip
                  status={
                    selectedLeave.status
                  }
                />

              </Box>

            </Box>

          )}

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setDetailsDialogOpen(false)
            }
          >
            Close
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
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
};

export default LeaveRequests;
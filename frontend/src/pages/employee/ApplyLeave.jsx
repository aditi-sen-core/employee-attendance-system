import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Paper,
  InputAdornment,
} from '@mui/material';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';

import { useAuth } from '../../context/AuthContext';
import leaveApi from '../../api/leaveApi';
import employeeApi from '../../api/employeeApi';
import ErrorMessage from '../../components/common/ErrorMessage';

export const ApplyLeave = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    if (user?.employeeId) {
      fetchProfile();
    }
  }, [user?.employeeId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await employeeApi.getMyProfile();

      setProfile(res.data);
    } catch (err) {
      console.error('Profile loading error:', err);

      const message =
        err.response?.data?.message ||
        'Failed to load profile';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TODAY
  // =========================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // CALCULATE LEAVE DAYS
  // =========================================================

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);

    const difference =
      end.getTime() - start.getTime();

    if (difference < 0) {
      return 0;
    }

    return Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1;
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const errors = {};

    const today = getToday();

    // Start date
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else if (formData.startDate < today) {
      errors.startDate =
        'Start date cannot be in the past';
    }

    // End date
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    // Date comparison
    if (
      formData.startDate &&
      formData.endDate
    ) {
      if (
        formData.endDate <
        formData.startDate
      ) {
        errors.endDate =
          'End date cannot be before start date';
      }
    }

    // Reason
    const reason = formData.reason.trim();

    if (!reason) {
      errors.reason = 'Reason is required';
    } else if (reason.length < 10) {
      errors.reason =
        'Reason must be at least 10 characters';
    }

    // Leave balance
    const leaveDays = calculateDays();
    const leaveBalance =
      profile?.leaveBalance || 0;

    if (
      leaveDays > 0 &&
      leaveDays > leaveBalance
    ) {
      errors.startDate =
        'Insufficient leave balance';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setError(null);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await leaveApi.applyForLeave({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });

      setSnackbar({
        open: true,
        message:
          'Leave application submitted successfully! 🎉',
        severity: 'success',
      });

      // Clear form
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
      });

      setFormErrors({});

      // Refresh profile / leave balance
      await fetchProfile();

    } catch (err) {
      console.error(
        'Leave application error:',
        err
      );

      const message =
        err.response?.data?.message ||
        'Failed to apply for leave. Please try again.';

      setError(message);

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const handleClear = () => {
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
    });

    setFormErrors({});
    setError(null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const leaveDays = calculateDays();

  const leaveBalance =
    profile?.leaveBalance || 0;

  const insufficientBalance =
    leaveDays > leaveBalance;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: '#172033',
          }}
        >
          Apply for Leave
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#718096',
            fontSize: '16px',
          }}
        >
          Submit your leave request to the HR team
        </Typography>
      </Box>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorMessage
            message={error}
            onRetry={fetchProfile}
          />
        </Box>
      )}


      {/* =====================================================
          LEAVE BALANCE
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,

          backgroundColor: '#E3F2FD',

          borderLeft:
            '4px solid #1976D2',

          borderRadius: '10px',

          boxShadow:
            '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Grid container spacing={4}>

          {/* Available Balance */}

          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',

                  backgroundColor:
                    'rgba(25,118,210,0.12)',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EventAvailableIcon
                  sx={{
                    color: '#1976D2',
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#607D8B',
                    fontSize: '14px',
                    mb: 0.5,
                  }}
                >
                  Available Leave Balance
                </Typography>

                <Typography
                  sx={{
                    color: '#1976D2',
                    fontSize: '26px',
                    fontWeight: 700,
                  }}
                >
                  {leaveBalance} days
                </Typography>
              </Box>
            </Box>
          </Grid>


          {/* Application Days */}

          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',

                  backgroundColor:
                    insufficientBalance
                      ? 'rgba(244,67,54,0.12)'
                      : 'rgba(76,175,80,0.12)',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarTodayIcon
                  sx={{
                    color:
                      insufficientBalance
                        ? '#F44336'
                        : '#4CAF50',
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#607D8B',
                    fontSize: '14px',
                    mb: 0.5,
                  }}
                >
                  Days for This Application
                </Typography>

                <Typography
                  sx={{
                    color:
                      insufficientBalance
                        ? '#F44336'
                        : '#4CAF50',

                    fontSize: '26px',
                    fontWeight: 700,
                  }}
                >
                  {leaveDays} days
                </Typography>
              </Box>
            </Box>
          </Grid>

        </Grid>


        {/* Insufficient Balance */}

        {insufficientBalance && (
          <Alert
            severity="warning"
            sx={{
              mt: 3,
              borderRadius: '8px',
            }}
          >
            You don't have enough leave balance
            for this request.
          </Alert>
        )}

      </Paper>


      {/* =====================================================
          LEAVE REQUEST FORM
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: '10px',
          border:
            '1px solid #E2E8F0',
          boxShadow:
            '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >

        <CardContent sx={{ p: 4 }}>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#172033',
              mb: 3,
            }}
          >
            Leave Request Form
          </Typography>


          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >

            <Grid container spacing={3}>

              {/* =================================================
                  START DATE
              ================================================= */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth

                  label="Start Date"

                  type="date"

                  name="startDate"

                  value={formData.startDate}

                  onChange={handleChange}

                  error={!!formErrors.startDate}

                  helperText={
                    formErrors.startDate
                  }

                  disabled={submitting}

                  InputLabelProps={{
                    shrink: true,
                  }}

                  inputProps={{
                    min: getToday(),
                  }}

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon
                          sx={{
                            color: '#718096',
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}

                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',

                      backgroundColor: '#FFFFFF',
                    },

                    '& .MuiInputLabel-root': {
                      backgroundColor: '#FFFFFF',
                      px: 0.5,
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  END DATE
              ================================================= */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth

                  label="End Date"

                  type="date"

                  name="endDate"

                  value={formData.endDate}

                  onChange={handleChange}

                  error={!!formErrors.endDate}

                  helperText={
                    formErrors.endDate
                  }

                  disabled={submitting}

                  InputLabelProps={{
                    shrink: true,
                  }}

                  inputProps={{
                    min:
                      formData.startDate ||
                      getToday(),
                  }}

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon
                          sx={{
                            color: '#718096',
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}

                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',

                      backgroundColor: '#FFFFFF',
                    },

                    '& .MuiInputLabel-root': {
                      backgroundColor: '#FFFFFF',
                      px: 0.5,
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  REASON
              ================================================= */}

              <Grid item xs={12}>

                <TextField
                  fullWidth

                  label="Reason for Leave"

                  multiline

                  rows={5}

                  name="reason"

                  value={formData.reason}

                  onChange={handleChange}

                  error={!!formErrors.reason}

                  helperText={
                    formErrors.reason ||
                    `${formData.reason.length}/500 characters`
                  }

                  placeholder="Please provide a reason for your leave request..."

                  disabled={submitting}

                  inputProps={{
                    maxLength: 500,
                  }}

                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },

                    '& .MuiInputLabel-root': {
                      backgroundColor: '#FFFFFF',
                      px: 0.5,
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  BUTTONS
              ================================================= */}

              <Grid item xs={12}>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >

                  <Button
                    type="submit"

                    variant="contained"

                    size="large"

                    startIcon={
                      submitting ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <SendIcon />
                      )
                    }

                    disabled={
                      submitting ||
                      insufficientBalance
                    }

                    sx={{
                      minHeight: 48,

                      px: 3,

                      borderRadius: '8px',

                      fontWeight: 600,

                      textTransform: 'none',

                      boxShadow:
                        '0 3px 8px rgba(25,118,210,0.25)',

                      '&:hover': {
                        boxShadow:
                          '0 5px 12px rgba(25,118,210,0.30)',
                      },
                    }}
                  >
                    {submitting
                      ? 'Submitting...'
                      : 'Submit Leave Request'}
                  </Button>


                  <Button
                    variant="outlined"

                    size="large"

                    startIcon={
                      <ClearIcon />
                    }

                    onClick={handleClear}

                    disabled={submitting}

                    sx={{
                      minHeight: 48,

                      px: 3,

                      borderRadius: '8px',

                      fontWeight: 600,

                      textTransform: 'none',
                    }}
                  >
                    Clear
                  </Button>

                </Box>

              </Grid>

            </Grid>

          </Box>

        </CardContent>

      </Card>


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

        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
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

export default ApplyLeave;
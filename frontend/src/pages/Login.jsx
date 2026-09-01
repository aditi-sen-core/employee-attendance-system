import React, { useState } from 'react';

import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import ErrorMessage from '../components/common/ErrorMessage';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const user = await login(email.trim(), password);

      // Redirect based on role
      if (user.role === 'HR') {
        navigate('/hr/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials and try again.';

      setErrorMessage(message);
    }
  };

  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background:
          'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',

        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },

        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },

        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="sm"
        disableGutters
        sx={{
          width: '100%',
        }}
      >
        <Card
          sx={{
            width: '100%',
            boxSizing: 'border-box',

            p: {
              xs: 2.5,
              sm: 4,
              md: 5,
            },

            borderRadius: {
              xs: 2,
              sm: 3,
            },

            boxShadow:
              '0 12px 40px rgba(0, 0, 0, 0.18)',
          }}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <Box
            textAlign="center"
            mb={{
              xs: 3,
              sm: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: '32px',
                  sm: '42px',
                },

                fontWeight: 700,

                lineHeight: 1.2,

                mb: 1,

                color: '#1F2937',
              }}
            >
              Welcome
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: '15px',
                  sm: '16px',
                },

                color: '#667085',
              }}
            >
              Employee Attendance System
            </Typography>
          </Box>

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (
            <Box mb={2}>
              <ErrorMessage message={errorMessage} />
            </Box>
          )}

          {/* =================================================
              LOGIN FORM

              IMPORTANT:
              Using a real form + type="submit" means
              pressing ENTER will submit the login.
          ================================================= */}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* EMAIL */}

            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  email: '',
                }));
              }}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              autoFocus
              autoComplete="email"
              sx={{
                mb: 1,
              }}
            />

            {/* PASSWORD */}

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: '',
                }));
              }}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
              }}
            />

            {/* =================================================
                LOGIN BUTTON

                NO onClick here.
                The form's onSubmit handles it.

                Therefore:
                - Click button -> login
                - Press Enter -> login
            ================================================= */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,

                minHeight: {
                  xs: 50,
                  sm: 54,
                },

                fontSize: {
                  xs: '15px',
                  sm: '16px',
                },

                fontWeight: 600,

                textTransform: 'uppercase',

                borderRadius: '6px',
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1 }}
                    color="inherit"
                  />

                  Logging in...
                </>
              ) : (
                'LOG IN'
              )}
            </Button>
          </Box>

          {/* =================================================
              DEMO CREDENTIALS
          ================================================= */}

          <Box
            sx={{
              mt: 2,

              p: {
                xs: 1.5,
                sm: 2,
              },

              backgroundColor: '#F5F7FA',

              borderRadius: 1,

              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                display: 'block',
                mb: 0.75,
                fontSize: '12px',
                fontWeight: 600,
                color: '#667085',
              }}
            >
              DEMO CREDENTIALS
            </Typography>

            <Typography
              sx={{
                display: 'block',
                fontSize: {
                  xs: '11px',
                  sm: '12px',
                },

                color: '#475467',

                wordBreak: 'break-word',

                mb: 0.5,
              }}
            >
              Employee: emp@example.com / pass123
            </Typography>

            <Typography
              sx={{
                display: 'block',
                fontSize: {
                  xs: '11px',
                  sm: '12px',
                },

                color: '#475467',

                wordBreak: 'break-word',
              }}
            >
              HR: hr@example.com / pass123
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
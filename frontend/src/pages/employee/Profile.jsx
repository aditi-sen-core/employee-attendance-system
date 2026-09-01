import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import employeeApi from '../../api/employeeApi';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import DateRangeIcon from '@mui/icons-material/DateRange';

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user?.employeeId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await employeeApi.getMyProfile();
      setProfile(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProfile} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View your account information
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={4}>
            {/* Avatar and Basic Info */}
            <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: '#0066CC',
                  fontSize: 48,
                  mb: 2,
                }}
              >
                {profile?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {profile?.name}
              </Typography>
              <Chip
                label={user?.role === 'HR' ? 'HR Manager' : 'Employee'}
                color={user?.role === 'HR' ? 'primary' : 'default'}
                variant="outlined"
              />
            </Grid>

            {/* Contact and Details */}
            <Grid item xs={12} md={8}>
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <EmailIcon sx={{ mr: 2, color: '#0066CC' }} />
                  <ListItemText
                    primary="Email"
                    secondary={profile?.email}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <BusinessIcon sx={{ mr: 2, color: '#0066CC' }} />
                  <ListItemText
                    primary="Department"
                    secondary={profile?.department}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <BadgeIcon sx={{ mr: 2, color: '#0066CC' }} />
                  <ListItemText
                    primary="Employee ID"
                    secondary={`#${profile?.id}`}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1 }}>
                  <DateRangeIcon sx={{ mr: 2, color: '#0066CC' }} />
                  <ListItemText
                    primary="Joining Date"
                    secondary={
                      profile?.joiningDate
                        ? new Date(profile.joiningDate).toLocaleDateString()
                        : 'N/A'
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Grid container spacing={3}>
        {/* Leave Balance */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Leave Balance
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {profile?.leaveBalance || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    days available
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Account Status
                  </Typography>
                  <Chip
                    label="Active"
                    color="success"
                    variant="filled"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Member Since */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Member Since
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).getFullYear()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Role Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Current Role
              </Typography>
              <Typography variant="body1">
                {user?.role === 'HR' ? 'HR Manager' : 'Employee'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                Role Description
              </Typography>
              <Typography variant="body1">
                {user?.role === 'HR'
                  ? 'Manage employees, attendance records, leave requests, and generate reports.'
                  : 'Clock in/out, apply for leave, and view your attendance records.'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import employeeApi from '../../api/employeeApi';
import ErrorMessage from '../../components/common/ErrorMessage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await employeeApi.getEmployeeById(id);
      setEmployee(res.data);
      setFormData(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load employee';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await employeeApi.updateEmployee(id, formData);

      setEmployee(formData);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Employee updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update employee';
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(employee);
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEmployee} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hr/employees')}
          sx={{ mr: 2 }}
        >
          Back to Employees
        </Button>
        <Box flex={1}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Employee Details
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {employee?.name}
          </Typography>
        </Box>
      </Box>

      {/* Employee Info Card */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Box>
              {!editMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ mr: 1 }}
                  >
                    {saving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                disabled={!editMode}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Manager</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={
                  formData.joiningDate
                    ? formData.joiningDate.split('T')[0]
                    : ''
                }
                onChange={handleChange}
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Leave Balance"
                name="leaveBalance"
                type="number"
                value={formData.leaveBalance || 0}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Card */}
      {employee && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Employee ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  #{employee.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Status
                </Typography>
                <Chip label="Active" color="success" variant="filled" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {employee.updatedAt
                    ? new Date(employee.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDetails;

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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import employeeApi from '../../api/employeeApi';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const Employees = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);

   // Add employee state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
    joiningDate: '',
    leaveBalance: 20,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toString().includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await employeeApi.getAllEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load employees';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

   // =========================================================
  // ADD EMPLOYEE
  // =========================================================

  const handleAddEmployee = () => {
    setNewEmployee({
      name: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
      department: '',
      joiningDate: '',
      leaveBalance: 20,
    });

    setError(null);
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;

    setNewEmployee((prev) => ({
      ...prev,
      [name]: name === 'leaveBalance' ? Number(value) : value,
    }));
  };

  const handleCreateEmployee = async () => {
  const errors = {};

  if (!newEmployee.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!newEmployee.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(newEmployee.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!newEmployee.password.trim()) {
    errors.password = 'Password is required';
  }

  if (!newEmployee.role) {
    errors.role = 'Role is required';
  }

  if (!newEmployee.department.trim()) {
    errors.department = 'Department is required';
  }

  if (!newEmployee.joiningDate) {
    errors.joiningDate = 'Joining date is required';
  }

  if (newEmployee.leaveBalance < 0) {
    errors.leaveBalance = 'Leave balance cannot be negative';
  }

  setFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  try {
    setAdding(true);
    setError(null);

    await employeeApi.createEmployee(newEmployee);

    setAddDialogOpen(false);
    setFormErrors({});

    await fetchEmployees();
  } catch (err) {
    const message =
      err.response?.data?.message || 'Failed to create employee';

    setError(message);
  } finally {
    setAdding(false);
  }
};

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      setDeleting(true);
      await employeeApi.deleteEmployee(selectedEmployee.id);

      setEmployees(
        employees.filter((emp) => emp.id !== selectedEmployee.id)
      );
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to delete employee';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading employees..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Employee Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage employees and their information
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchEmployees} />
      )}

      {/* Search and Add */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search by name, email, or ID..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button variant="contained" color="primary" onClick={handleAddEmployee}>
          + Add Employee
        </Button>
      </Box>

      {/* Employees Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Employees ({filteredEmployees.length})
          </Typography>

          {filteredEmployees.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>#{employee.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department || 'N/A'}</TableCell>
                      <TableCell>
                        {employee.role === 'HR' ? 'HR Manager' : 'Employee'}
                      </TableCell>
                      <TableCell>
                        {employee.joiningDate
                          ? new Date(employee.joiningDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() =>
                              navigate(`/hr/employees/${employee.id}`)
                            }
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(employee)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" py={4}>
              No employees found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Employee</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newEmployee.name}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newEmployee.email}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={newEmployee.password}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={newEmployee.role}
                onChange={handleNewEmployeeChange}
                required
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="HR">HR Manager</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={newEmployee.department}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={newEmployee.joiningDate}
                onChange={handleNewEmployeeChange}
                slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Leave Balance"
                name="leaveBalance"
                type="number"
                value={newEmployee.leaveBalance}
                onChange={handleNewEmployeeChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setAddDialogOpen(false)}
            disabled={adding}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateEmployee}
            disabled={adding}
          >
            {adding ? 'Creating...' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </Box>
  );
};

export default Employees;

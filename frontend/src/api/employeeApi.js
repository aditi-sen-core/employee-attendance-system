import api from './axios';

export const employeeApi = {
  getMyProfile: () => {
    return api.get('/employees/me');
  },

  getAllEmployees: () => {
    return api.get('/employees');
  },

  getEmployeeById: (id) => {
    return api.get(`/employees/${id}`);
  },

  createEmployee: (employeeData) => {
    return api.post('/employees', employeeData);
  },

  updateEmployee: (id, employeeData) => {
    return api.put(`/employees/${id}`, employeeData);
  },

  deleteEmployee: (id) => {
    return api.delete(`/employees/${id}`);
  },
};

export default employeeApi;

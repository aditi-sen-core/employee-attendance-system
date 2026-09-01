import api from './axios';

export const leaveApi = {
  applyForLeave: (leaveData) => {
    return api.post('/leaves', leaveData);
  },

  getMyLeaves: () => {
    return api.get('/leaves/my');
  },

  getAllLeaves: () => {
    return api.get('/leaves');
  },

  getPendingLeaves: () => {
    return api.get('/leaves/pending');
  },

  approveLeave: (id) => {
    return api.put(`/leaves/${id}/approve`);
  },

  rejectLeave: (id) => {
    return api.put(`/leaves/${id}/reject`);
  },
};

export default leaveApi;

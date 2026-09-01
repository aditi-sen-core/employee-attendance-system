import api from './axios';

export const authApi = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
};

export default authApi;

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const verifyOTP = async (userId, otp) => {
  const res = await axios.post(`${API_URL}/verify-otp`, { userId, otp });
  return res.data;
};

export const resendOTP = async (userId) => {
  const res = await axios.post(`${API_URL}/resend-otp`, { userId });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await axios.post(`${API_URL}/reset-password`, { token, password });
  return res.data;
};

// Profile endpoints use /api/users
export const getProfile = async (token) => {
  const res = await axios.get('http://localhost:8080/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProfile = async (token, updates) => {
  const res = await axios.put('http://localhost:8080/api/users/profile', updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 
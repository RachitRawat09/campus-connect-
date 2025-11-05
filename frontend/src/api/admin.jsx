import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

export const getAdminStats = async (token) => {
  const res = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAdminUsers = async ({ token, limit = 10, search = '' }) => {
  const res = await axios.get(`${API_URL}/users`, {
    params: { limit, search },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAdminUserById = async (id, token) => {
  const res = await axios.get(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAdminListings = async ({ token, search = '', page = 1, pageSize = 20 }) => {
  const res = await axios.get(`${API_URL}/listings`, {
    params: { search, page, pageSize },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAdminComplaints = async ({ token, status = '' }) => {
  const res = await axios.get(`${API_URL}/complaints`, {
    params: { status },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};




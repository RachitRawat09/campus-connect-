import axios from "axios";

const API_URL = "/api/complaints";

export const createComplaint = async (complaintData, token) => {
  try {
    const response = await axios.post(API_URL, complaintData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

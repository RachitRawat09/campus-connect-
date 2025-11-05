import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/messages`;

export const sendMessage = async (data, token) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMessages = async (userId, listingId, token) => {
  const params = { userId };
  if (listingId) params.listingId = listingId;
  const res = await axios.get(API_URL, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllUsers = async (token) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/all`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// New conversation APIs
export const initiateConversation = async (data, token) => {
  const res = await axios.post(`${API_URL}/initiate`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const acceptConversation = async (conversationId, token) => {
  const res = await axios.post(
    `${API_URL}/conversations/${conversationId}/accept`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getConversations = async (token) => {
  const res = await axios.get(`${API_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const initiateSale = async (conversationId, token) => {
  const res = await axios.post(
    `${API_URL}/initiate-sale`,
    { conversationId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const confirmSale = async (conversationId, token) => {
  const res = await axios.post(
    `${API_URL}/confirm-sale`,
    { conversationId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const rateSellerForConversation = async (
  conversationId,
  rating,
  token
) => {
  const res = await axios.post(
    `${API_URL}/conversations/${conversationId}/rate`,
    { rating },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

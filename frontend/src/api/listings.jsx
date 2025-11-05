import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/listings`;

export const getListings = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const getListingById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createListing = async (data, token) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
};

export const getDepartments = async () => {
  const res = await axios.get(`${API_URL}/departments`);
  return res.data;
};

export const getPurchasesByUser = async (userId, token) => {
  try {
    console.log("Making purchase request with:", {
      userId,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 10) + "..." : "none",
    });

    const res = await axios.get(`${API_URL}/purchases`, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Purchase request error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await axios.post(`${API_URL}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.imageUrl;
};

export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  const res = await axios.post(`${API_URL}/upload-images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.imageUrls;
};

export const purchaseListing = async (id, buyerId, token) => {
  const res = await axios.put(
    `${API_URL}/${id}`,
    { buyer: buyerId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Plans disabled – no client APIs

export const markAsSold = async (listingId, buyerId, token) => {
  const res = await axios.put(
    `${API_URL}/${listingId}/sold`,
    { buyerId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const deleteListing = async (listingId, token) => {
  const res = await axios.delete(`${API_URL}/${listingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

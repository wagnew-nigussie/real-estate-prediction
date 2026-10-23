import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const loginUser = async (credentials: any) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  return response.data;
};

export const predictPropertyPrice = async (propertyData: any, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/predict`, propertyData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPredictionHistory = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/predict/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

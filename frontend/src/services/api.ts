import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

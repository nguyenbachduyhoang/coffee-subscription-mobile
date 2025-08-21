import axios from 'axios';

const BASE_URL = 'http://minhkhoi02-001-site1.anytempurl.com/api/Customer';

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}) => {
  const res = await axios.post(`${BASE_URL}/register`, data);
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/login`, { email, password }, {
    headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
    responseType: 'text'
  });
  return res.data;
};

export const verifyEmail = async (token: string) => {
  const res = await axios.post(`${BASE_URL}/verify`, { token });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await axios.post(`${BASE_URL}/forgot-password?email=${email}`);
  return res.data;
};

export const resetPassword = async (token: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/reset-password`, { token, password });
  return res.data;
};

import axios from 'axios';

const BASE_URL = 'http://minhkhoi02-001-site1.anytempurl.com/api/Customer';

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/login`, { email, password }, {
    headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
    responseType: 'text' // Thêm dòng này để nhận về chuỗi token
  });
  return res.data; // chính là token
};

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

export const getProfile = async (token: string) => {
  const res = await axios.get(`${BASE_URL}/my-profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const logout = () => {
  // Nếu chỉ cần xóa token ở client, không cần gọi API
};

export const verify = async (token: string) => {
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

export const updateProfile = async (
  token: string,
  data: { name: string; email: string; phone: string; address: string }
) => {
  const res = await axios.post(`${BASE_URL}/update-profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

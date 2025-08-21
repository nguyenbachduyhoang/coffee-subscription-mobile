import axios from 'axios';

const BASE_URL = 'http://minhkhoi02-001-site1.anytempurl.com/api';

// Category
export const getAllCategory = async () => {
  const res = await axios.get(`${BASE_URL}/Category/get-all-category`);
  return res.data;
};

export const getCategoryById = async (id: string | number) => {
  const res = await axios.get(`${BASE_URL}/Category/get-category-by-id/${id}`);
  return res.data;
};

// Product
export const getProductById = async (id: string | number) => {
  const res = await axios.get(`${BASE_URL}/Product/get-product-by-id/${id}`);
  return res.data;
};

export const getCoffeeProduct = async () => {
  const res = await axios.get(`${BASE_URL}/Product/get-coffee-product`);
  return res.data;
};

export const getFreezeProduct = async () => {
  const res = await axios.get(`${BASE_URL}/Product/get-freeze-product`);
  return res.data;
};

export const getTeaProduct = async () => {
  const res = await axios.get(`${BASE_URL}/Product/get-tea-product`);
  return res.data;
};

// Plan
export const getAllPlans = async () => {
  const res = await axios.get(`${BASE_URL}/Plan/get-all-plans`);
  return res.data;
};

export const getPlanById = async (id: string | number) => {
  const res = await axios.get(`${BASE_URL}/Plan/get-plan-by-id/${id}`);
  return res.data;
};

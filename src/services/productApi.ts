import { productsApi as api, categoriesApi as catApi, plansApi as planApi } from './api';

// Category
export const getAllCategory = catApi.getAllCategories;
export const getCategoryById = catApi.getCategoryById;

// Product
export const getProductById = api.getProductById;
export const getCoffeeProduct = api.getCoffeeProducts;
export const getFreezeProduct = api.getFreezeProducts;
export const getTeaProduct = api.getTeaProducts;

// Plan
export const getAllPlans = planApi.getAllPlansAlt;
export const getPlanById = planApi.getPlanByIdAlt;

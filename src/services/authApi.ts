import { authApi as api } from './api';

// Re-export all auth functions from centralized API
export const verifyEmail = api.verifyEmail;
export const login = {
  customer: api.loginCustomer,
  staff: api.loginStaff,
};
export const register = api.register;
export const getProfile = api.getProfile;
export const getStaffProfile = api.getStaffProfile;
export const testToken = api.testToken;
export const logout = () => {
  // Nếu chỉ cần xóa token ở client, không cần gọi API
};
export const verify = api.verifyEmail;
export const forgotPassword = api.forgotPassword;
export const resetPassword = api.resetPassword;
export const updateProfile = api.updateProfile;

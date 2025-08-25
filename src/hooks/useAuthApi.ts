import { authApi } from '../services/api';

// Re-export functions from centralized API service
export const login = authApi.loginCustomer;
export const register = authApi.register;
export const getProfile = authApi.getProfile;
export const logout = () => {
  // Nếu chỉ cần xóa token ở client, không cần gọi API
};
export const verify = authApi.verifyEmail;
export const forgotPassword = authApi.forgotPassword;
export const resetPassword = authApi.resetPassword;
export const updateProfile = authApi.updateProfile;

import React, { ReactNode } from 'react';
import { AuthContext, useAuthLogic } from '../hooks/useAuth';

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authLogic = useAuthLogic();

  return (
    <AuthContext.Provider value={authLogic}>
      {children}
    </AuthContext.Provider>
  );
};
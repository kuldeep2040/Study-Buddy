// const { user, login, logout } = useAuth();  — usable in any component inside <AuthProvider>.
import { useContext } from 'react';
import { AuthContext } from '../context/authContext.js';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

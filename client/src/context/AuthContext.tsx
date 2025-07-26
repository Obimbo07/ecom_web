import api from '@/api';
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    token: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // AuthProvider no longer manages state directly, it just provides the children
  // The actual login/logout/register logic will be handled in components using useDispatch
  return (
    <>
      {children}
    </>
  );
};

export const useAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, user, loading, error } = useSelector((state: RootState) => state.auth) as AuthState;

  const register = async (username: string, email: string, password: string) => {
    dispatch(loginStart());
    try {
      const response = await api.post('/users/register/', { username, email, password });
      console.log(response, 'response');
      dispatch(loginSuccess({ id: 'new-user', username, email, token: 'new-dummy-token' }));
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data.detail || 'Registration failed due to an unknown error.';
        dispatch(loginFailure(errorMessage));
        throw new Error(errorMessage);
      }
      dispatch(loginFailure('Network error. Please check your connection.'));
      throw new Error('Network error. Please check your connection.');
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: (userData: { id: string; username: string; email: string; token: string }) => dispatch(loginSuccess(userData)),
    logout: () => dispatch(logout()),
    register,
  };
};

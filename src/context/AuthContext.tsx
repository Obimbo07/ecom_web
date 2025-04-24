import api from '@/api';
import { createContext, useState, useContext, ReactNode } from 'react';

// import { useNavigate } from 'react-router-dom';
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  register: (username: string, email: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [username, setUsername] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  // const [email, setEmail] = useState<string>('');
  // const [error, setError] = useState<string>('');
  const login = () => setIsAuthenticated(true);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false)
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/users/register/', { username, email, password });
      console.log(response, 'response');
      // On success, no need to throw; the calling function can handle navigation
    } catch (err: any) {
      if (err.response) {
        // Extract the specific error message from the backend's 'detail' field
        const errorMessage = err.response.data.detail || 'Registration failed due to an unknown error.';
        throw new Error(errorMessage); // Throw the specific error
      }
      throw new Error('Network error. Please check your connection.'); // Generic network error
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
import api from '@/api';
import { createContext, useState, useContext, ReactNode } from 'react';

// import { useNavigate } from 'react-router-dom';
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  register: (username: any, email: any, password: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [username, setUsername] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  // const [email, setEmail] = useState<string>('');
  // const [error, setError] = useState<string>('');
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const register =  async (username: any, email: any, password: any) => {
    try {
      const response = await api.post('/users/users/register', { username, email, password });
      console.log(response);
     return response;
    } catch (err) {
      console.log('Login failed. Check your credentials.');
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
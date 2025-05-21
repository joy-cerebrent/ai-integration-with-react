import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginSchemaType, RegisterSchemaType } from '@/validators/AuthSchema';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginSchemaType) => Promise<void>;
  register: (values: RegisterSchemaType) => Promise<void>;
  logout: () => void;
}

const API_URL = 'http://localhost:5109';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const extractUserInfo = (userDetails:any):User => {
    // Create user object from validation response
    const user: User = {
      id: userDetails.id, // Assuming we don't get an ID directly from validation
      email: userDetails.email, // Using username from validation as email
      name: userDetails.name, // Using username from validation as name
    };
    localStorage.setItem('user', JSON.stringify(user)); // Store user info in localStorage
    return user;
  }

  const login = async ({ email, password }: LoginSchemaType) => {
    try {
      const res = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email, // API expects username field based on the schema
          password 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.errorMessage || 'Login failed');

      // API returns AuthResponse object
      const { accessToken, refreshToken, success, errorMessage } = data;
      
      if (!success) {
        throw new Error(errorMessage || 'Login failed');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Get user info from token validation
      await validateAndSetUserInfo(accessToken);
      
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  };

  const validateAndSetUserInfo = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/Auth/verify-token-and-get-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.isValid) {
        throw new Error(data.errorMessage || 'Token validation failed');
      }
  
      // Create user object from the userDetails in the response
      const user = extractUserInfo(data.userDetails);
      
      setUser(user);
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  };

  const register = async ({ name, email, password }: RegisterSchemaType) => {
    try {
      const res = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // API expects username field
          email,
          password,
          firstName: name.split(' ')[0], // Split name into firstName
          lastName: name.split(' ').slice(1).join(' ') || '' // and lastName
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.errorMessage || data.detail || 'Registration failed');

      // We can either directly set tokens from registration response or login
      if (data.success && data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        await validateAndSetUserInfo(data.accessToken);
        navigate('/');
      } else {
        // If no tokens in registration response, proceed with login
        await login({ email, password });
      }
    } catch (error) {
      console.error('Registration failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      if (refreshToken) {
        await fetch(`${API_URL}/api/Auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const userDetails = localStorage.getItem('user');
    const parsedUserDetails = userDetails ? JSON.parse(userDetails) : null;
    if (parsedUserDetails) {
      setUser(parsedUserDetails); // Set user from localStorage if available
    }

    if (!token) {
      if (!['/login', '/signup'].includes(location.pathname)) {
        navigate('/login');
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/Auth/verify-token-and-get-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
       
      if (!res.ok || !data.isValid) {
        throw new Error(data.errorMessage || 'Invalid token');
      }
       
      // Create user object from validation response
      const user = extractUserInfo(data.userDetails);
       
      setUser(user);
      
      if (['/login', '/register'].includes(location.pathname)) {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth validation failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
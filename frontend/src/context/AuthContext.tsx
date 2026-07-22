import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  hasRole: (roles: string[]) => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  const [user, setUser] = useState<any | null>(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      try { return JSON.parse(atob(stored.split('.')[1])); } catch (e) {}
    }
    return null;
  });

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      setUser(JSON.parse(atob(newToken.split('.')[1])));
    } catch (e) {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles: string[]) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r: string) => allowedRoles.includes(r));
  };

  return (
    <AuthContext.Provider value={{ token, user, hasRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createContext, useContext, useState } from 'react';
import { logout as apiLogout } from '../lib/api';

interface AuthContextType {
  user: { id: number; name?: string; profile_url?: string } | null;
  login: (userData: { id: number; name?: string; profile_url?: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: number; name?: string; profile_url?: string } | null>(null);

  const login = (userData: { id: number; name?: string; profile_url?: string }) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show a toast here
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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

import React, { createContext, useState, useContext } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextData = {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, pass: string) => {
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser({ id: '1', name: 'Test User', email });
  };

  const register = async (name: string, email: string, pass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser({ id: '1', name, email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsSubscribed(JSON.parse(localStorage.getItem('subscription') || 'false'));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login
    const userData = {
      id: '1',
      email,
      name: email.split('@')[0]
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const signup = (email, password) => {
    // Mock signup
    return login(email, password);
  };

  const logout = () => {
    setUser(null);
    setIsSubscribed(false);
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
  };

  const subscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem('subscription', 'true');
  };

  const value = {
    user,
    isSubscribed,
    loading,
    login,
    signup,
    logout,
    subscribe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
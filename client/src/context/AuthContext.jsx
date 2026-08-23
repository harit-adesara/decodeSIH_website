import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bharat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("bharat_token"));
  const [loading, setLoading] = useState(false);

  // Global Location Context for State -> District -> City Cascades
  const [locationContext, setLocationContext] = useState({
    state: "Maharashtra",
    district: "Pune",
    city: "All",
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("bharat_token", token);
    } else {
      localStorage.removeItem("bharat_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("bharat_user", JSON.stringify(user));
      // Auto set location context if user has assigned state/district
      if (user.state && user.state !== "All") {
        setLocationContext((prev) => ({
          ...prev,
          state: user.state,
          district: user.district !== "All" ? user.district : prev.district,
          city: user.city !== "All" ? user.city : prev.city,
        }));
      }
    } else {
      localStorage.removeItem("bharat_user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      if (res.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", userData);
      if (res.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bharat_token");
    localStorage.removeItem("bharat_user");
  };

  // 1-Click Quick Demo Role Switcher for instant testing
  const quickSwitchDemo = async (role) => {
    const demoCredentials = {
      admin: { email: "admin@bharatswasthya.gov.in", password: "password123" },
      doctor: { email: "doctor@bharatswasthya.gov.in", password: "password123" },
      health_assistant: { email: "assistant@bharatswasthya.gov.in", password: "password123" },
      user: { email: "user@bharatswasthya.gov.in", password: "password123" },
    };

    const creds = demoCredentials[role];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const updateLocation = (state, district, city) => {
    setLocationContext({
      state: state || "Maharashtra",
      district: district || "All",
      city: city || "All",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || "user",
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        quickSwitchDemo,
        locationContext,
        updateLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

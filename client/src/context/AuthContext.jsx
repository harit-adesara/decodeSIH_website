import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bharat_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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

  // Unified Login (handles all roles: admin, doctor, health_assistant, user)
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

  // Citizen Registration
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", userData);
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Verify Email Address
  const verifyEmail = async (verificationToken) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/verify-email", { token: verificationToken });
      if (res.data?.token && res.data?.user) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification
  const resendVerification = async (email) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with Token
  const resetPassword = async (resetToken, newPassword) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${resetToken}`, { newPassword });
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Change Password (Authenticated)
  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/change-password", { oldPassword, newPassword });
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Update Profile (Authenticated)
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.put("/auth/profile", profileData);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bharat_token");
    localStorage.removeItem("bharat_user");
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
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        logout,
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

export default AuthContext;

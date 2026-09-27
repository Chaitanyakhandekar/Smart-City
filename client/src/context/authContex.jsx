import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";
import toast from "react-hot-toast";

export const authContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!token && !!user;
  const role = user?.role || null;

  // Verify session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authApi.getMe();
        if (response.data && response.data.data && response.data.data.user) {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (error) {
        console.warn("Session expired or invalid token:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { user: loggedInUser, token: receivedToken } = response.data.data;

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setToken(receivedToken);
      setUser(loggedInUser);

      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return { success: true, user: loggedInUser };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please verify your credentials.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      const { user: registeredUser, token: receivedToken } = response.data.data;

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(registeredUser));

      setToken(receivedToken);
      setUser(registeredUser);

      toast.success("Account created successfully! Welcome to Smart City.");
      return { success: true, user: registeredUser };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue clearing local state regardless
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      toast.success("Logged out successfully.");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.data?.data?.user) {
        const freshUser = response.data.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <authContext.Provider
      value={{
        user,
        token,
        role,
        isLoggedIn,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default authContext;
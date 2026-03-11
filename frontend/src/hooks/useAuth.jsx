import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const AuthContext = createContext(null);

const isRole = (value) => {
  return value === "customer" || value === "dealer" || value === "admin" || value === "staff";
};

const normalizeUser = (raw) => {
  if (!raw) return null;
  const id = raw.id ?? raw._id;
  if (!id) return null;

  return {
    id: String(id),
    name: raw.name || "",
    email: raw.email || "",
    role: isRole(raw.role) ? raw.role : "customer",
    avatar: raw.avatar || undefined,
    phone: raw.phone || undefined,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await apiClient.get("/auth/user");
          const normalized = normalizeUser(response.data);
          if (!normalized) {
            logout();
            return;
          }
          setUser(normalized);
        } catch (error) {
          console.error("Failed to verify user", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = (userData, userToken) => {
    const normalized = normalizeUser(userData);
    if (!normalized) {
      logout();
      return;
    }

    setUser(normalized);
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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

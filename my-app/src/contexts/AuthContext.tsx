"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userAPI, authAPI } from "@/src/lib/api";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  enrolled_courses: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("current_user");
      const accessToken = localStorage.getItem("access_token");

      if (storedUser && accessToken) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally fetch fresh user data
          const freshUser = await userAPI.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem("current_user", JSON.stringify(freshUser));
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          localStorage.removeItem("current_user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token, refresh_token } = await authAPI.login(
        email,
        password
      );

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Fetch user data
      const userData = await userAPI.getCurrentUser();
      setUser(userData);
      localStorage.setItem("current_user", JSON.stringify(userData));
    } catch (error: any) {
      // Parse error message from API
      let message = "Ошибка входа";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        // Translate common error messages
        if (typeof detail === "string") {
          if (
            detail.toLowerCase().includes("invalid credentials") ||
            detail.toLowerCase().includes("incorrect") ||
            detail.toLowerCase().includes("wrong password")
          ) {
            message = "Неверный email или пароль";
          } else if (
            detail.toLowerCase().includes("not found") ||
            detail.toLowerCase().includes("user does not exist")
          ) {
            message = "Пользователь не найден";
          } else if (
            detail.toLowerCase().includes("not active") ||
            detail.toLowerCase().includes("inactive")
          ) {
            message = "Аккаунт не активирован";
          } else if (detail.toLowerCase().includes("not verified")) {
            message = "Email не подтверждён";
          } else {
            message = detail;
          }
        } else if (Array.isArray(detail)) {
          message = detail.map((d) => d.msg || d).join(", ");
        }
      } else if (error.message) {
        message = error.message;
      } else if (error.code === "ERR_NETWORK") {
        message = "Ошибка сети. Проверьте подключение к интернету";
      }

      throw new Error(message);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }) => {
    try {
      const { access_token, refresh_token } = await authAPI.register(data);

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Fetch user data
      const userData = await userAPI.getCurrentUser();
      setUser(userData);
      localStorage.setItem("current_user", JSON.stringify(userData));
    } catch (error: any) {
      // Parse error message from API
      let message = "Ошибка регистрации";

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          if (
            detail.toLowerCase().includes("already exists") ||
            detail.toLowerCase().includes("already registered") ||
            detail.toLowerCase().includes("email is already")
          ) {
            message = "Пользователь с таким email уже существует";
          } else if (detail.toLowerCase().includes("password")) {
            message = "Пароль слишком простой. Используйте минимум 8 символов";
          } else if (
            detail.toLowerCase().includes("email") &&
            detail.toLowerCase().includes("invalid")
          ) {
            message = "Некорректный email адрес";
          } else {
            message = detail;
          }
        } else if (Array.isArray(detail)) {
          // Handle validation errors (FastAPI format)
          const errors = detail.map((d) => {
            const field = d.loc?.[d.loc.length - 1] || "";
            const msg = d.msg || "";
            if (field === "email") return "Некорректный email";
            if (field === "password")
              return "Пароль должен быть минимум 8 символов";
            if (field === "confirm_password") return "Пароли не совпадают";
            return msg;
          });
          message = errors.join(". ");
        }
      } else if (error.code === "ERR_NETWORK") {
        message = "Ошибка сети. Проверьте подключение к интернету";
      }

      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword);
    } catch (error: any) {
      const message = error.response?.data?.detail || "Password change failed";
      throw new Error(message);
    }
  };

  const updateProfile = async (data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }) => {
    try {
      const updatedUser = await userAPI.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem("current_user", JSON.stringify(updatedUser));
    } catch (error: any) {
      const message = error.response?.data?.detail || "Profile update failed";
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await userAPI.getCurrentUser();
      setUser(userData);
      localStorage.setItem("current_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        changePassword,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

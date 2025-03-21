// src/contexts/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Khởi tạo state dựa trên việc có tồn tại token hay không
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Optional: Cập nhật lại nếu có bất kỳ thay đổi nào trong localStorage (ví dụ: sau khi đăng xuất hay token hết hạn)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:3003/auth/login", {
        username,
        password,
      });
      console.log("Login response:", response);
      const { access_token } = response.data;
      // Lưu token vào localStorage
      localStorage.setItem("access_token", access_token);
      const payload = access_token.split(".")[1];
      const data = atob(payload);
      console.log("Token data:", JSON.parse(data));
      const { permissions } = JSON.parse(data);
      localStorage.setItem("permission", JSON.stringify(permissions));
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error("Đăng nhập thất bại");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  return isAuthenticated !== null ? (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  ) : null;
};

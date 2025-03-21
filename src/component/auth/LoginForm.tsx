// src/components/LoginForm.tsx
"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Form, Input, Button, message } from "antd";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(username, password);
      message.success("Đăng nhập thành công!");
      router.push("/");
    } catch (error: any) {
      message.error(error.message || "Đăng nhập thất bại");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "300px",
        padding: "2rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "0.5rem",
          borderRadius: "4px",
          border: "none",
          background: "#0070f3",
          color: "#fff",
        }}
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;

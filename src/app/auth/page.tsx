import LoginForm from "@/component/auth/LoginForm";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        background: "#fff", // Màu nền trắng
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <LoginForm />
    </div>
  );
};

export default LoginPage;

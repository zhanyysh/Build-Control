"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import styles from "./login.module.css";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/token", formData);
      toast.success("Welcome back!", { id: loadingToast });
      login(res.data.access_token, res.data.role);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to login", { id: loadingToast });
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>BuildControl KR</h1>
        <p className={styles.subtitle}>Login to your account</p>

        <div className={styles.inputGroup}>

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        
        <button type="submit" className={styles.button}>Login</button>
      </form>
    </div>
  );
}

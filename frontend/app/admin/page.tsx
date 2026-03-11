"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./admin.module.css";
import { UserPlus, Trash2, Shield, User as UserIcon, HardHat } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Worker");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (user && user.role !== "Administrator") {
    router.push("/dashboard");
    return null;
  }

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users/").then((res) => res.data),
  });

  const createUser = useMutation({
    mutationFn: (data: any) => api.post("/users/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuccess("User created successfully!");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("Worker");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Failed to create user");
      setTimeout(() => setError(""), 3000);
    }
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>User Management</h1>

        <div className={styles.grid}>
          {/* Create User Form */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <UserPlus size={20} />
              <span>Create New User</span>
            </h2>
            
            <form 
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                createUser.mutate({ email, full_name: fullName, password, role });
              }}
            >
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}

              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                  placeholder="John Doe"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="john@example.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Administrator">Administrator</option>
                  <option value="Foreman">Foreman</option>
                  <option value="Worker">Worker</option>
                </select>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </button>
            </form>
          </section>

          {/* User List */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <UserIcon size={20} />
              <span>System Users</span>
            </h2>
            
            <div className={styles.userList}>
              {isLoading ? (
                <p>Loading users...</p>
              ) : (
                users?.map((u) => (
                  <div key={u.id} className={styles.userItem}>
                    <div className={styles.userAvatar}>
                      {u.role === "Administrator" ? <Shield size={20} /> : 
                       u.role === "Foreman" ? <HardHat size={20} /> : 
                       <UserIcon size={20} />}
                    </div>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{u.full_name}</p>
                      <p className={styles.userEmail}>{u.email}</p>
                      <span className={`${styles.roleBadge} ${styles[u.role.toLowerCase()]}`}>
                        {u.role}
                      </span>
                    </div>
                    {u.id !== user?.id && (
                      <button 
                        onClick={() => {
                          if (confirm(`Delete user ${u.full_name}?`)) {
                            deleteUser.mutate(u.id);
                          }
                        }}
                        className={styles.deleteBtn}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

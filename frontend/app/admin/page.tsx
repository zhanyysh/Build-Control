"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./admin.module.css";
import { UserPlus, Trash2, Shield, User as UserIcon, HardHat, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  company_id: number;
}

interface Company {
  id: number;
  name: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // User Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Worker");
  const [companyId, setCompanyId] = useState("");
  
  // Company Form state
  const [companyName, setCompanyName] = useState("");

  if (user && !["Administrator", "System Administrator"].includes(user.role)) {
    router.push("/dashboard");
    return null;
  }

  const isSystemAdmin = user?.role === "System Administrator";

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users/").then((res) => res.data),
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies/").then((res) => res.data),
    enabled: isSystemAdmin, // Only load companies for system admins
  });

  const createUser = useMutation({
    mutationFn: (data: any) => api.post("/users/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("Worker");
      setCompanyId("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create user");
    }
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to delete user");
    }
  });

  const createCompany = useMutation({
    mutationFn: (data: any) => api.post("/companies/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company created successfully!");
      setCompanyName("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create company");
    }
  });

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>System Control Panel</h1>

        <div className={styles.grid}>
          {isSystemAdmin && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Building2 size={20} />
                <span>Create Client Company</span>
              </h2>
              <form 
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  createCompany.mutate({ name: companyName });
                }}
              >
                <div className={styles.inputGroup}>
                  <label>Company Name</label>
                  <input 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    required 
                    placeholder="Stark Industries"
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={createCompany.isPending}
                >
                  {createCompany.isPending ? "Creating..." : "Create Company"}
                </button>
              </form>
            </section>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <UserPlus size={20} />
              <span>Create New User</span>
            </h2>
            
            <form 
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                const payload: any = { email, full_name: fullName, password, role };
                if (isSystemAdmin) {
                  payload.company_id = Number(companyId);
                }
                createUser.mutate(payload);
              }}
            >
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
                  {isSystemAdmin && <option value="Administrator">Administrator</option>}
                  <option value="Foreman">Foreman</option>
                  <option value="Worker">Worker</option>
                </select>
              </div>

              {isSystemAdmin && (
                <div className={styles.inputGroup}>
                  <label>Assign to Company</label>
                  <select 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                    required
                  >
                    <option value="">Select a Company...</option>
                    {companies?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={createUser.isPending}
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </button>
            </form>
          </section>

          <section className={styles.card} style={{ gridColumn: "1 / -1" }}>
            <h2 className={styles.cardTitle}>
              <UserIcon size={20} />
              <span>{isSystemAdmin ? "Global System Users" : "Company Users"}</span>
            </h2>
            
            <div className={styles.userList}>
              {usersLoading ? (
                <p>Loading users...</p>
              ) : (
                users?.map((u) => (
                  <div key={u.id} className={styles.userItem}>
                    <div className={styles.userAvatar}>
                      {u.role === "System Administrator" ? <Shield size={20} color="red" /> : 
                       u.role === "Administrator" ? <Shield size={20} /> : 
                       u.role === "Foreman" ? <HardHat size={20} /> : 
                       <UserIcon size={20} />}
                    </div>
                    <div className={styles.userInfo}>
                      <span style={{display: "flex", gap: "10px", alignItems: "center"}}>
                        <p className={styles.userName}>{u.full_name}</p>
                        {isSystemAdmin && (
                          <span style={{fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--surface)", padding: "2px 6px", borderRadius: "var(--radius-sm)"}}>
                            Company #{u.company_id}
                          </span>
                        )}
                      </span>
                      <p className={styles.userEmail}>{u.email}</p>
                      <span className={`${styles.roleBadge} ${styles[u.role.toLowerCase().replace(" ", "-")]}`}>
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

"use client";

import { useAuth } from "@/hooks/useAuth";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          BuildControl KR
        </Link>
        
        <div className={styles.links}>
          <Link href="/dashboard" className={styles.link}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          {user.role === "Administrator" && (
            <Link href="/admin" className={styles.link}>
              <UserIcon size={20} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.full_name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
          <button onClick={logout} className={styles.logoutBtn} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import styles from "./dashboard.module.css";
import { Building2, Users, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SystemStats {
  company_count: number;
  user_count: number;
  project_count: number;
}

interface Company {
  id: number;
  name: string;
}

export default function SystemOwnerDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ["stats"],
    queryFn: () => api.get("/stats").then((res) => res.data),
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies/").then((res) => res.data),
  });

  if (statsLoading || companiesLoading) {
    return <div className={styles.loading}>Loading System Data...</div>;
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>System Control Center</h1>
      </header>

      <section className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Building2 className={styles.statIcon} />
            <span>Total Client Companies</span>
          </div>
          <p className={styles.statValue}>{stats?.company_count || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Users className={styles.statIcon} />
            <span>Total Platform Users</span>
          </div>
          <p className={styles.statValue}>{stats?.user_count || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FolderOpen className={styles.statIcon} />
            <span>Total Active Projects</span>
          </div>
          <p className={styles.statValue}>{stats?.project_count || 0}</p>
        </div>
      </section>

      <section className={styles.projectSection}>
        <h2 className={styles.sectionTitle}>Client Directory</h2>
        <div className={styles.projectGrid}>
          {companies?.map((company) => (
            <div key={company.id} className={styles.projectCardWrapper} style={{ cursor: "default" }}>
              <div className={styles.projectCard}>
                <h3 className={styles.projectName}>{company.name}</h3>
                <p className={styles.projectAddress} style={{ marginTop: "1rem" }}>
                  Internal ID: {company.id}
                </p>
                <div style={{ marginTop: "1rem" }}>
                   <Link href={`/admin`} style={{ color: "var(--brand)", textDecoration: "underline", fontSize: "0.875rem", fontWeight: 600 }}>Manage Users</Link>
                </div>
              </div>
            </div>
          ))}
          {companies?.length === 0 && (
            <div className={styles.emptyState}>
              <p>No active companies found.</p>
              <Link href="/admin">Create your first client</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./dashboard.module.css";
import { Plus, Building2, CheckCircle2, ListTodo, Package } from "lucide-react";
import Link from "next/link";
import FormattedDate from "@/components/FormattedDate";

interface Stats {
  project_count: number;
  task_count: number;
  completed_tasks: number;
  completion_percentage: number;
}

interface Project {
  id: number;
  name: string;
  address: string;
  start_date: string;
  end_date: string;
  description: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => api.get("/stats").then((res) => res.data),
    enabled: !!user,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects/").then((res) => res.data),
    enabled: !!user,
  });

  if (authLoading || statsLoading || projectsLoading) {
    return <div className={styles.loading}>Loading Dashboard...</div>;
  }

  if (!user) return null;

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          {user.role === "Administrator" && (
            <Link href="/dashboard/new-project" className={styles.addButton}>
              <Plus size={20} />
              <span>New Project</span>
            </Link>
          )}
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Building2 className={styles.statIcon} />
              <span>Total Projects</span>
            </div>
            <p className={styles.statValue}>{stats?.project_count || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <ListTodo className={styles.statIcon} />
              <span>Total Tasks</span>
            </div>
            <p className={styles.statValue}>{stats?.task_count || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <CheckCircle2 className={styles.statIcon} />
              <span>Completed Tasks</span>
            </div>
            <p className={styles.statValue}>{stats?.completed_tasks || 0}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <Package className={styles.statIcon} />
              <span>Completion Rate</span>
            </div>
            <div className={styles.progressContainer}>
              <p className={styles.statValue}>{Math.round(stats?.completion_percentage || 0)}%</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${stats?.completion_percentage || 0}%` }} 
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.projectSection}>
          <h2 className={styles.sectionTitle}>Active Projects</h2>
          <div className={styles.projectGrid}>
            {projects?.map((project) => (
              <Link 
                key={project.id} 
                href={`/dashboard/projects/${project.id}`}
                className={styles.projectCard}
              >
                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectAddress}>{project.address}</p>
                <div className={styles.projectDates}>
                  <span>Starts: <FormattedDate date={project.start_date} /></span>
                  <span>Ends: <FormattedDate date={project.end_date} /></span>
                </div>
              </Link>
            ))}
            {projects?.length === 0 && (
              <div className={styles.emptyState}>
                <p>No active projects found.</p>
                {user.role === "Administrator" && (
                  <Link href="/dashboard/new-project">Create your first project</Link>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

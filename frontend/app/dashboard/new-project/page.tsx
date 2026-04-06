"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./new-project.module.css";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && !["Administrator", "System Administrator"].includes(user.role)) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Creating project...");

    try {
      await api.post("/projects/", {
        name,
        address,
        start_date: startDate,
        end_date: endDate,
        description
      });
      toast.success("Project created!", { id: loadingToast });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create project", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.content}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Create New Project</h1>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Riverside Complex Phase 1"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address">Site Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g., 123 Construction Rd, Kyiv"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="endDate">Expected End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief overview of the project scope..."
              rows={4}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </main>
  );
}

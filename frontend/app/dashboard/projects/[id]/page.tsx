"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./project-detail.module.css";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Circle,
  Package,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FormattedDate from "@/components/FormattedDate";

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  worker_id?: number;
}

interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface Project {
  id: number;
  name: string;
  address: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface User {
  id: number;
  full_name: string;
  role: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"tasks" | "materials">("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  
  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskWorkerId, setTaskWorkerId] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");
  const [photoComment, setPhotoComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Data fetching
  const { data: users } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users/").then((res) => res.data),
    enabled: user?.role === "Administrator" || user?.role === "Foreman",
  });

  // Mutations
  const addTask = useMutation({
    mutationFn: (data: any) => api.post("/tasks/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setShowTaskForm(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskDeadline("");
      setTaskWorkerId("");
    }
  });

  const addMaterial = useMutation({
    mutationFn: (data: any) => api.post("/materials/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", id] });
      setShowMaterialForm(false);
      setMaterialName("");
      setMaterialQty("");
      setMaterialUnit("");
    }
  });

  const uploadPhoto = useMutation({
    mutationFn: (formData: FormData) => 
      api.post("/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
    onSuccess: () => {
      setUploadingTaskId(null);
      setPhotoComment("");
      setSelectedFile(null);
      alert("Photo uploaded successfully!");
    }
  });

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => api.get(`/projects/${id}`).then((res) => res.data),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", id],
    queryFn: () => api.get(`/tasks/?project_id=${id}`).then((res) => res.data),
  });

  const { data: materials, isLoading: materialsLoading } = useQuery<Material[]>({
    queryKey: ["materials", id],
    queryFn: () => api.get(`/materials/?project_id=${id}`).then((res) => res.data),
  });

  // Mutations
  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) => 
      api.patch(`/tasks/${taskId}?status=${status}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  if (projectLoading || tasksLoading || materialsLoading) {
    return <div className={styles.loading}>Loading Project Details...</div>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.content}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        <header className={styles.header}>
          <div className={styles.projectInfo}>
            <h1 className={styles.title}>{project.name}</h1>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{project.address}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>
                  <FormattedDate date={project.start_date} /> - <FormattedDate date={project.end_date} />
                </span>
              </div>
            </div>
            {project.description && (
              <p className={styles.description}>{project.description}</p>
            )}
          </div>
        </header>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "tasks" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks ({tasks?.length || 0})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "materials" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("materials")}
          >
            Materials ({materials?.length || 0})
          </button>
        </div>

        {activeTab === "tasks" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Project Tasks</h2>
              {(user?.role === "Administrator" || user?.role === "Foreman") && (
                <button 
                  className={styles.addButton}
                  onClick={() => setShowTaskForm(!showTaskForm)}
                >
                  <Plus size={18} />
                  <span>{showTaskForm ? "Cancel" : "Add Task"}</span>
                </button>
              )}
            </div>

            {showTaskForm && (
              <form 
                className={styles.inlineForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  addTask.mutate({
                    title: taskTitle,
                    description: taskDesc,
                    deadline: taskDeadline,
                    project_id: Number(id),
                    worker_id: taskWorkerId ? Number(taskWorkerId) : null
                  });
                }}
              >
                <div className={styles.inputGroup}>
                  <label>Task Title</label>
                  <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Assign Worker</label>
                  <select value={taskWorkerId} onChange={(e) => setTaskWorkerId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {users?.filter(u => u.role !== "Administrator").map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Deadline</label>
                  <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Description</label>
                  <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={2} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={addTask.isPending}>
                  {addTask.isPending ? "Adding..." : "Save Task"}
                </button>
              </form>
            )}

            <div className={styles.taskList}>
              {tasks?.map((task) => (
                <React.Fragment key={task.id}>
                  <div className={styles.taskCard}>
                    <div className={styles.taskMain}>
                      <div className={styles.taskStatus}>
                        {task.status === "Completed" ? (
                          <CheckCircle2 className={styles.completedIcon} />
                        ) : task.status === "In Progress" ? (
                          <Clock className={styles.inProgressIcon} />
                        ) : (
                          <Circle className={styles.plannedIcon} />
                        )}
                      </div>
                      <div className={styles.taskDetails}>
                        <h3 className={styles.taskTitle}>{task.title}</h3>
                        <p className={styles.taskDesc}>{task.description}</p>
                        <div className={styles.taskMeta}>
                          <span>Deadline: <FormattedDate date={task.deadline} /></span>
                          {task.worker_id ? (
                            <span className={styles.workerBadge}>
                              {users?.find(u => u.id === task.worker_id)?.full_name || "Assigned"}
                            </span>
                          ) : (
                            <span className={styles.unassignedBadge}>Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.taskActions}>
                      {task.status !== "Completed" && (
                        <select 
                          className={styles.statusSelect}
                          value={task.status}
                          onChange={(e) => updateTaskStatus.mutate({ taskId: task.id, status: e.target.value })}
                        >
                          <option value="Planned">Planned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}
                      <button 
                        className={styles.iconBtn} 
                        title="Upload Photo"
                        onClick={() => setUploadingTaskId(uploadingTaskId === task.id ? null : task.id)}
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                  </div>
                  {uploadingTaskId === task.id && (
                    <div className={styles.photoUploadSection}>
                      <h4>Upload Proof of Completion</h4>
                      <div className={styles.uploadForm}>
                        <input 
                          type="file" 
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept="image/*"
                        />
                        <input 
                          type="text" 
                          placeholder="Add a comment..."
                          value={photoComment}
                          onChange={(e) => setPhotoComment(e.target.value)}
                        />
                        <button 
                          onClick={() => {
                            if (!selectedFile) return;
                            const formData = new FormData();
                            formData.append("task_id", String(task.id));
                            formData.append("file", selectedFile);
                            if (photoComment) formData.append("comment", photoComment);
                            uploadPhoto.mutate(formData);
                          }}
                          disabled={!selectedFile || uploadPhoto.isPending}
                          className={styles.submitBtn}
                        >
                          {uploadPhoto.isPending ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
              {tasks?.length === 0 && <p className={styles.emptyMsg}>No tasks created yet.</p>}
            </div>
          </section>
        )}

        {activeTab === "materials" && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Inventory</h2>
              {(user?.role === "Administrator" || user?.role === "Foreman") && (
                <button 
                  className={styles.addButton}
                  onClick={() => setShowMaterialForm(!showMaterialForm)}
                >
                  <Plus size={18} />
                  <span>{showMaterialForm ? "Cancel" : "Add Material"}</span>
                </button>
              )}
            </div>

            {showMaterialForm && (
              <form 
                className={styles.inlineForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  addMaterial.mutate({
                    name: materialName,
                    quantity: Number(materialQty),
                    unit: materialUnit,
                    project_id: Number(id)
                  });
                }}
              >
                <div className={styles.inputGroup}>
                  <label>Material Name</label>
                  <input value={materialName} onChange={(e) => setMaterialName(e.target.value)} required placeholder="e.g., Cement" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Quantity</label>
                  <input type="number" value={materialQty} onChange={(e) => setMaterialQty(e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Unit</label>
                  <input value={materialUnit} onChange={(e) => setMaterialUnit(e.target.value)} required placeholder="e.g., bags" />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={addMaterial.isPending}>
                  {addMaterial.isPending ? "Adding..." : "Save Material"}
                </button>
              </form>
            )}

            <div className={styles.materialGrid}>
              {materials?.map((material) => (
                <div key={material.id} className={styles.materialCard}>
                  <Package className={styles.materialIcon} />
                  <div className={styles.materialInfo}>
                    <h3 className={styles.materialName}>{material.name}</h3>
                    <p className={styles.materialQuantity}>
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                  {(user?.role === "Administrator" || user?.role === "Foreman") && (
                    <button className={styles.deductBtn}>Deduct</button>
                  )}
                </div>
              ))}
              {materials?.length === 0 && <p className={styles.emptyMsg}>No materials added yet.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

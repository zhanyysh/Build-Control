"use client";

import Link from "next/link";
import styles from "./landing.module.css";
import { Building2, CheckCircle2, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>BuildControl KR</span>
          <Link href="/login" className={styles.loginBtn}>Login to System</Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Modern Construction <br /> 
            <span>Project Management</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Streamline your construction workflows with real-time task tracking, 
            photo reporting, and material management.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/login" className={styles.primaryBtn}>Get Started</Link>
            <a href="#features" className={styles.secondaryBtn}>Learn More</a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Building2 size={300} strokeWidth={0.5} color="#0070f3" />
        </div>
      </main>

      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why BuildControl KR?</h2>
          <p>Designed to solve real problems in the construction industry.</p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><CheckCircle2 /></div>
            <h3>Task Tracking</h3>
            <p>Assign tasks to workers and track progress in real-time. Know exactly what's being done on site.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><BarChart3 /></div>
            <h3>Progress Visualization</h3>
            <p>Visual dashboards showing completion rates and project timelines at a glance.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Building2 /></div>
            <h3>Material Control</h3>
            <p>Keep track of materials and equipment. Deduct usage as work progresses.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><Users /></div>
            <h3>Role-Based Access</h3>
            <p>Specific interfaces for Administrators, Foremen, and Workers to ensure focused workflows.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 BuildControl KR. All rights reserved.</p>
      </footer>
    </div>
  );
}

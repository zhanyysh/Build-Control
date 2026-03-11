"use client";

import { useState, useEffect } from "react";

interface FormattedDateProps {
  date: string | Date;
}

export default function FormattedDate({ date }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{new Date(date).toISOString().split('T')[0]}</span>; // Fallback to stable ISO format during SSR
  }

  return <>{new Date(date).toLocaleDateString()}</>;
}

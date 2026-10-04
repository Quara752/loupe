"use client";

import { useApp } from "@/context/AppContext";
import styles from "./Toast.module.scss";

export default function ToastHost() {
  const { toasts } = useApp();

  return (
    <div className={styles.host}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

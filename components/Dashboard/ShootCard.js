"use client";

import { useApp } from "@/context/AppContext";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import styles from "./ShootCard.module.scss";

const STATUS_LABEL = {
  completed: "Completed",
  generating: "Generating",
};

const STATUS_CLASS = {
  completed: common.statusCompleted,
  "needs-attention": common.statusAttention,
  generating: common.statusGenerating,
};

export default function ShootCard({ shoot }) {
  const { openShoot, regenerateFailedFor, deleteShoot } = useApp();
  const statusLabel =
    shoot.status === "needs-attention"
      ? `${shoot.failed} need attention`
      : STATUS_LABEL[shoot.status] || shoot.status;

  const handleDelete = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Delete this shoot and all its assets? This cannot be undone."
      )
    ) {
      deleteShoot(shoot.shootId);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        {shoot.thumb && <img src={shoot.thumb} alt={shoot.name} />}
      </div>
      <div className={styles.body}>
        <span className={cx(common.statusChip, STATUS_CLASS[shoot.status])}>
          {statusLabel}
        </span>
        <h4 className={styles.name}>{shoot.name}</h4>
        <div className={styles.sub}>
          {shoot.sku} · {shoot.shootId}
        </div>
        <div className={styles.subMuted}>
          {shoot.completed}/{shoot.assetCount} assets · {shoot.createdAt}
        </div>
        <div className={styles.actions}>
          <button
            className={cx(common.btnGhostLight, common.btnSm)}
            onClick={() => openShoot(shoot.shootId)}
          >
            Open
          </button>
          <button
            className={cx(common.btnGhostLight, common.btnSm)}
            onClick={() => regenerateFailedFor(shoot.shootId)}
          >
            Regenerate
          </button>
          <button
            className={cx(common.btnDanger, common.btnSm)}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

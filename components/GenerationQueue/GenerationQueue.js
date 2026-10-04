"use client";

import { useApp } from "@/context/AppContext";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import { ASSET_TYPES } from "@/lib/constants";
import styles from "./GenerationQueue.module.scss";

function StatusIcon({ status }) {
  if (status === "pending") {
    return <span className={styles.queuedLabel}>Queued</span>;
  }
  if (status === "generating") {
    return <div className={styles.spin}></div>;
  }
  if (status === "completed") {
    return <span className={styles.check}>✓</span>;
  }
  return <span className={styles.fail}>✕</span>;
}

export default function GenerationQueue() {
  const { activeShoot, openDashboard, openShoot } = useApp();

  if (!activeShoot) return null;

  const done = activeShoot.assets.filter((a) => a.status === "completed").length;
  const failed = activeShoot.assets.filter((a) => a.status === "failed").length;
  const finished = activeShoot.assets.every(
    (a) => a.status === "completed" || a.status === "failed"
  );

  return (
    <main>
      <div className={styles.queueWrap}>
        <div className={styles.head}>
          <div className={cx(common.kicker, styles.kicker)}>Generating</div>
          <h2>{activeShoot.name}</h2>
          <p>
            Loupe is composing the nine-asset shoot. You can leave this page —
            the shoot will keep going and appear on your dashboard.
          </p>
        </div>

        <div className={styles.list}>
          {activeShoot.assets.map((a) => (
            <div className={styles.row} key={a.key}>
              <span className={styles.num}>{a.num}</span>
              {a.dataUrl ? (
                <img className={styles.thumb} src={a.dataUrl} alt="" />
              ) : (
                <div className={styles.thumb}></div>
              )}
              <span className={styles.name}>{a.label}</span>
              <span className={styles.status}>
                <StatusIcon status={a.status} />
              </span>
            </div>
          ))}
        </div>

        <div className={styles.progressLine}>
          {finished
            ? `${done}/${ASSET_TYPES.length} assets completed${
                failed ? ` · ${failed} need${failed === 1 ? "s" : ""} regeneration` : ""
              }`
            : `${done}/${ASSET_TYPES.length} completed`}
        </div>

        <div className={styles.actions}>
          {finished ? (
            <>
              <button className={common.btnGhostDark} onClick={openDashboard}>
                Go to dashboard
              </button>
              <button
                className={common.btnPrimary}
                onClick={() => openShoot(activeShoot.shootId)}
              >
                View shoot →
              </button>
            </>
          ) : (
            <button className={common.btnGhostDark} onClick={openDashboard}>
              Leave page — keep generating
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

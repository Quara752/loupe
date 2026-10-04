"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import ShootCard from "./ShootCard";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const { shoots, goHome } = useApp();

  return (
    <div className={styles.surface}>
      <Navbar variant="light" active="dashboard" />
      <main>
        <div className={common.wrap}>
          <div className={styles.pageHead}>
            <div className={cx(common.kicker, styles.kicker)}>Your shoots</div>
            <h2>Dashboard</h2>
            <p>
              {shoots.length} shoot{shoots.length === 1 ? "" : "s"} saved on
              this device.
            </p>
          </div>

          {shoots.length === 0 ? (
            <div className={common.emptyState}>
              <div className={common.display} style={{ fontSize: 22, color: "#2B241D", marginBottom: 10 }}>
                No shoots yet
              </div>
              <p>
                Upload a jewelry photo to generate your first nine-asset
                campaign.
              </p>
              <div style={{ marginTop: 20 }}>
                <button className={common.btnPrimary} onClick={goHome}>
                  Start a new shoot
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {shoots.map((s) => (
                <ShootCard key={s.shootId} shoot={s} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className={styles.footNote}>
        Shoots are stored privately in this browser and never visible to
        other users.
      </footer>
    </div>
  );
}

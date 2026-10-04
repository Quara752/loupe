"use client";

import { useApp } from "@/context/AppContext";
import cx from "@/lib/cx";
import styles from "./Navbar.module.scss";

export default function Navbar({ variant = "dark", active = "home" }) {
  const { goHome, openDashboard } = useApp();
  const isLight = variant === "light";

  return (
    <div className={cx(styles.topnav, isLight && styles.light)}>
      <button
        className={cx(styles.brand, isLight && styles.brandLight)}
        onClick={goHome}
      >
        <span className={styles.mark}>◈</span>LOUPE
      </button>
      <div className={styles.navlinks}>
        <button
          className={cx(
            styles.navlink,
            isLight && styles.navlinkLight,
            active === "home" && (isLight ? styles.activeLight : styles.active)
          )}
          onClick={goHome}
        >
          New Shoot
        </button>
        <button
          className={cx(
            styles.navlink,
            isLight && styles.navlinkLight,
            active === "dashboard" &&
              (isLight ? styles.activeLight : styles.active)
          )}
          onClick={openDashboard}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}

"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import LotCard from "./LotCard";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import { ASSET_TYPES } from "@/lib/constants";
import styles from "./ShootDetail.module.scss";

export default function ShootDetail() {
  const { activeShoot, downloadZip } = useApp();

  if (!activeShoot) return null;

  const done = activeShoot.assets.filter((a) => a.status === "completed").length;
  const failed = activeShoot.assets.filter((a) => a.status === "failed").length;

  return (
    <div className={styles.surface}>
      <Navbar variant="light" active="dashboard" />
      <main>
        <div className={common.wrap}>
          <div className={styles.detailHead}>
            <div className={styles.titleBlock}>
              <div className={cx(common.kicker, styles.shootIdLabel)}>
                {activeShoot.shootId}
              </div>
              <h2>{activeShoot.name}</h2>
              <div className={styles.meta}>
                <div className={cx(common.idrow, styles.metaCol)}>
                  <span className={common.idrowKey}>SKU</span>
                  <span className={common.idrowValue}>{activeShoot.sku}</span>
                </div>
                <div className={cx(common.idrow, styles.metaCol)}>
                  <span className={common.idrowKey}>Category</span>
                  <span className={common.idrowValue}>
                    {activeShoot.category}
                  </span>
                </div>
                <div className={cx(common.idrow, styles.metaCol)}>
                  <span className={common.idrowKey}>Created</span>
                  <span className={common.idrowValue}>
                    {activeShoot.createdAt}
                  </span>
                </div>
                <div className={cx(common.idrow, styles.metaCol)}>
                  <span className={common.idrowKey}>Status</span>
                  <span className={common.idrowValue}>
                    {done}/{ASSET_TYPES.length} done{failed ? `, ${failed} failed` : ""}
                  </span>
                </div>
              </div>
            </div>
            <button className={common.btnPrimary} onClick={downloadZip}>
              ⬇ Download complete shoot
            </button>
          </div>

          <div className={styles.lotGrid}>
            {activeShoot.assets.map((a) => (
              <LotCard key={a.key} asset={a} />
            ))}
          </div>
        </div>
      </main>
      <footer className={styles.footNote}>
        Files follow the pattern {activeShoot.sku}_NN_Name — ready to drop
        into Shopify, Amazon, or your website.
      </footer>
    </div>
  );
}

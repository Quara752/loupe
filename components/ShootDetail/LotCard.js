"use client";

import { useApp } from "@/context/AppContext";
import cx from "@/lib/cx";
import { ASSET_TYPES } from "@/lib/constants";
import common from "@/styles/common.module.scss";
import styles from "./LotCard.module.scss";

export default function LotCard({ asset }) {
  const { downloadAsset, regenerateAsset } = useApp();
  // Video generation disabled for now.
  // const isVideo = asset.key === "MODEL_VIDEO";

  let media;
  if (asset.status === "completed") {
    media = (
      <>
        <img src={asset.dataUrl} alt={asset.label} />
        {/* {isVideo && (
          <div className={styles.videoBadge}>
            <div className={styles.playCircle}>▶</div>
          </div>
        )} */}
      </>
    );
  } else if (asset.status === "failed") {
    media = (
      <div className={styles.placeholder}>
        Generation failed
        <br />
        Ready to retry
      </div>
    );
  } else {
    media = (
      <div className={cx(styles.placeholder, styles.queuedPlaceholder)}>
        Queued…
      </div>
    );
  }

  return (
    <div className={styles.lotCard}>
      <div className={styles.frame}>
        <div className={cx(styles.corner, styles.cornerTl)}></div>
        <div className={cx(styles.corner, styles.cornerBr)}></div>
        <div className={styles.badge}>{asset.num}</div>
        {media}
      </div>
      <div className={styles.info}>
        <div className={styles.lotNum}>LOT {asset.num} / {ASSET_TYPES.length}</div>
        <h4 className={styles.name}>{asset.label}</h4>
        <div className={styles.actions}>
          <button
            className={cx(common.btnGhostLight, common.btnSm)}
            disabled={asset.status !== "completed"}
            onClick={() => downloadAsset(asset.key)}
          >
            Download
          </button>
          <button
            className={cx(common.btnGhostLight, common.btnSm)}
            onClick={() => regenerateAsset(asset.key)}
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

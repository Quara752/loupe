"use client";

import { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import styles from "./Home.module.scss";

const GUIDANCE = [
  "Place jewelry on a clean surface",
  "Keep the complete product visible",
  "Use good, even lighting",
  "Avoid heavy shadows or reflections",
];

export default function Home() {
  const { uploadFile } = useApp();
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0];
    uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    uploadFile(file);
  };

  return (
    <>
      <Navbar variant="dark" active="home" />
      <main>
          <div className={common.wrap}>
            <div className={styles.hero}>
              <div className={styles.eyebrow}>
                Virtual Jewelry Photography Studio
              </div>
              <h1 className={styles.heroTitle}>
                One photo. <em>A complete campaign.</em>
              </h1>
              <p className={styles.heroSub}>
                Upload a single jewelry photo and Loupe composes the full
                nine-shot ecommerce set — box, angles, macro, model, lifestyle,
                and social — while keeping every stone and setting
                true to the original.
              </p>
            </div>

            <div className={styles.uploadGrid}>
              <label className={styles.uploadCard} htmlFor="fileGallery">
                <span className={styles.icon}>🖼</span>
                <h3>Upload from gallery</h3>
                <p>
                  JPG, PNG, or WEBP. High-resolution images work best — Loupe
                  will prepare the crop automatically.
                </p>
              </label>

              <label className={styles.uploadCard} htmlFor="fileCamera">
                <span className={styles.icon}>📷</span>
                <h3>Take a photo</h3>
                <p>
                  Place the piece on a clean surface with even light. Loupe
                  guides framing before you confirm the shot.
                </p>
              </label>

              <div
                className={cx(styles.dropzone, dragging && styles.dropzoneActive)}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() => galleryRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                Drag a jewelry photo anywhere in this box, or{" "}
                <button
                  className={styles.browseBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    galleryRef.current?.click();
                  }}
                >
                  browse files
                </button>
              </div>
            </div>

            <input
              ref={galleryRef}
              className={styles.hiddenInput}
              id="fileGallery"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
            />
            <input
              ref={cameraRef}
              className={styles.hiddenInput}
              id="fileCamera"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleChange}
            />
          </div>

        <div className={styles.guidance}>
          {GUIDANCE.map((g) => (
            <span key={g} className={styles.guidanceItem}>
              <span className={styles.dot}></span>
              {g}
            </span>
          ))}
        </div>
      </main>
      <footer className={styles.footNote}>
        Loupe — demo prototype. Asset generation is simulated for preview
        purposes.
      </footer>
    </>
  );
}

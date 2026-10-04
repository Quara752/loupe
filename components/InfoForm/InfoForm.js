"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar/Navbar";
import {
  BACKGROUNDS,
  CATEGORIES,
  MODELS_OPT,
  RATIOS,
  STYLES,
} from "@/lib/constants";
import { autoName, autoSku } from "@/lib/naming";
import cx from "@/lib/cx";
import common from "@/styles/common.module.scss";
import styles from "./InfoForm.module.scss";

function PillGroup({ label, options, value, onChange }) {
  return (
    <>
      <label className={styles.flabel}>{label}</label>
      <div className={styles.pillGroup}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={cx(common.pill, opt === value && common.pillSelected)}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}

export default function InfoForm() {
  const { draft, updateDraft, goHome, beginGeneration } = useApp();
  const [advOpen, setAdvOpen] = useState(false);

  if (!draft) return null;

  const previewName = draft.name || autoName(draft.category);
  const previewSku = draft.sku || autoSku(previewName, draft.category);

  return (
    <div className={styles.surface}>
      <Navbar variant="light" active="home" />
      <main>
        <div className={common.wrap}>
          <div className={styles.pageHead}>
            <div className={cx(common.kicker, styles.kicker)}>Step 2 of 3</div>
            <h2>Tell Loupe about the piece</h2>
            <p>
              Fields are optional — leave them blank and Loupe assigns a
              professional shoot name and SKU automatically.
            </p>
          </div>

          <div className={styles.layout}>
            <div>
              <div className={cx(styles.fieldGroup, styles.fieldRow)}>
                <div>
                  <label className={styles.flabel}>Product name</label>
                  <input
                    className={styles.finput}
                    placeholder={previewName}
                    value={draft.name}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={styles.flabel}>SKU / product code</label>
                  <input
                    className={styles.finput}
                    placeholder={previewSku}
                    value={draft.sku}
                    onChange={(e) => updateDraft({ sku: e.target.value })}
                  />
                </div>
              </div>

              <div className={cx(styles.fieldGroup, styles.fieldRow)}>
                <div>
                  <label className={styles.flabel}>Category</label>
                  <select
                    className={styles.finput}
                    value={draft.category}
                    onChange={(e) => updateDraft({ category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.flabel}>Collection</label>
                  <input
                    className={styles.finput}
                    placeholder="e.g. Monsoon Bridal"
                    value={draft.collection}
                    onChange={(e) => updateDraft({ collection: e.target.value })}
                  />
                </div>
              </div>

              <div className={cx(styles.fieldGroup, styles.fieldRow)}>
                <div>
                  <label className={styles.flabel}>
                    Brand name <span>(optional)</span>
                  </label>
                  <input
                    className={styles.finput}
                    placeholder="e.g. Aranya Jewels"
                    value={draft.brand}
                    onChange={(e) => updateDraft({ brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className={styles.flabel}>
                    Description <span>(optional)</span>
                  </label>
                  <input
                    className={styles.finput}
                    placeholder="Short internal note"
                    value={draft.description}
                    onChange={(e) =>
                      updateDraft({ description: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                className={styles.advToggle}
                onClick={() => setAdvOpen((v) => !v)}
                aria-expanded={advOpen}
              >
                <span>Generation controls</span>
                <span>{advOpen ? "－" : "＋"}</span>
              </button>

              {advOpen && (
                <div className={styles.advPanel}>
                  <PillGroup
                    label="Shoot style"
                    options={STYLES}
                    value={draft.style}
                    onChange={(v) => updateDraft({ style: v })}
                  />
                  <PillGroup
                    label="Background"
                    options={BACKGROUNDS}
                    value={draft.background}
                    onChange={(v) => updateDraft({ background: v })}
                  />
                  <PillGroup
                    label="Model"
                    options={MODELS_OPT}
                    value={draft.model}
                    onChange={(v) => updateDraft({ model: v })}
                  />
                  <PillGroup
                    label="Social aspect ratio"
                    options={RATIOS}
                    value={draft.ratio}
                    onChange={(v) => updateDraft({ ratio: v })}
                  />
                </div>
              )}

              <div className={styles.actions}>
                <button className={common.btnGhostLight} onClick={goHome}>
                  Back
                </button>
                <button className={common.btnPrimary} onClick={beginGeneration}>
                  Generate complete shoot →
                </button>
              </div>
            </div>

            <div className={styles.previewPane}>
              <div className={styles.previewFrame}>
                <div className={cx(styles.corner, styles.cornerTl)}></div>
                <div className={cx(styles.corner, styles.cornerBr)}></div>
                <img src={draft.originalImage} alt="Uploaded jewelry photo" />
              </div>
              <div className={styles.previewIds}>
                <div className={common.idrow}>
                  <span className={common.idrowKey}>Shoot name</span>
                  <span className={common.idrowValue}>{previewName}</span>
                </div>
                <div className={common.idrow}>
                  <span className={common.idrowKey}>SKU</span>
                  <span className={common.idrowValue}>{previewSku}</span>
                </div>
                <div className={common.idrow}>
                  <span className={common.idrowKey}>Shoot ID</span>
                  <span className={common.idrowValue}>
                    {draft.previewShootId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footNote}>
        9 assets will be generated: box, front, side, 45°, top, macro, model,
        lifestyle, social.
      </footer>
    </div>
  );
}

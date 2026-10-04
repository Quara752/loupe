"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import JSZip from "jszip";
import { ASSET_TYPES } from "@/lib/constants";
import { autoName, autoSku, newShootId, prettyDate } from "@/lib/naming";
import {
  fileToImage,
  urlToImage,
  validateFile,
} from "@/lib/canvasGen";
import { regenerateOneAsset, runFullQueue } from "@/lib/generation";
import {
  deleteShootStorage,
  getIndex,
  indexEntryFromShoot,
  loadShootFull,
  saveShootFull,
  upsertIndexEntry,
} from "@/lib/storage";

const AppContext = createContext(null);

const DEFAULT_DRAFT = {
  category: "Necklace",
  name: "",
  sku: "",
  collection: "",
  brand: "",
  description: "",
  style: "Luxury",
  background: "White",
  model: "Female",
  ratio: "4:5",
};

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("home");
  const [draft, setDraft] = useState(null);
  const [activeShoot, setActiveShoot] = useState(null);
  const [shoots, setShoots] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Session-only cache of decoded <img> elements, keyed by shootId,
  // so regeneration doesn't have to re-decode the source data URL.
  const imgCacheRef = useRef({});

  const showToast = useCallback((msg) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const goHome = useCallback(() => setScreen("home"), []);

  const openDashboard = useCallback(async () => {
    const idx = await getIndex();
    setShoots(idx);
    setScreen("dashboard");
  }, []);

  const startDraft = useCallback((img, dataUrl) => {
    setDraft({
      ...DEFAULT_DRAFT,
      img,
      originalImage: dataUrl,
      previewShootId: newShootId(),
    });
    setScreen("info");
  }, []);

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        showToast(err);
        return;
      }
      showToast("Preparing image…");
      try {
        const img = await fileToImage(file);
        startDraft(img, img.src);
      } catch (e) {
        showToast("Could not read that image — try another file.");
      }
    },
    [showToast, startDraft]
  );

  const updateDraft = useCallback((patch) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchActiveAsset = useCallback((shootId, key, status, dataUrl) => {
    setActiveShoot((prev) => {
      if (!prev || prev.shootId !== shootId) return prev;
      return {
        ...prev,
        assets: prev.assets.map((a) =>
          a.key === key ? { ...a, status, ...(dataUrl ? { dataUrl } : {}) } : a
        ),
      };
    });
  }, []);

  const beginGeneration = useCallback(async () => {
    if (!draft) return;
    const shootName = draft.name || autoName(draft.category);
    const sku = draft.sku || autoSku(shootName, draft.category);
    const shootId = draft.previewShootId;

    const shoot = {
      shootId,
      sku,
      name: shootName,
      category: draft.category,
      collection: draft.collection,
      brand: draft.brand,
      description: draft.description,
      style: draft.style,
      background: draft.background,
      model: draft.model,
      ratio: draft.ratio,
      originalImage: draft.originalImage,
      createdAt: prettyDate(),
      status: "generating",
      assets: ASSET_TYPES.map((a) => ({ ...a, status: "pending", dataUrl: null })),
    };

    imgCacheRef.current[shootId] = draft.img;
    setActiveShoot(shoot);
    setScreen("queue");

    const finalShoot = await runFullQueue(shoot, draft.img, {
      onStatusChange: (key, status, dataUrl) =>
        patchActiveAsset(shootId, key, status, dataUrl),
    });

    setActiveShoot(finalShoot);
    await saveShootFull(finalShoot);
    const idx = await upsertIndexEntry(indexEntryFromShoot(finalShoot));
    setShoots(idx);
  }, [draft, patchActiveAsset]);

  const openShoot = useCallback(
    async (shootId) => {
      let shoot =
        activeShoot && activeShoot.shootId === shootId
          ? activeShoot
          : await loadShootFull(shootId);
      if (!shoot) {
        showToast("Could not find that shoot.");
        await openDashboard();
        return;
      }
      setActiveShoot(shoot);
      setScreen("detail");
    },
    [activeShoot, openDashboard, showToast]
  );

  const getOrLoadImage = useCallback(async (shoot) => {
    if (imgCacheRef.current[shoot.shootId]) {
      return imgCacheRef.current[shoot.shootId];
    }
    const img = await urlToImage(shoot.originalImage);
    imgCacheRef.current[shoot.shootId] = img;
    return img;
  }, []);

  const regenerateAsset = useCallback(
    async (key) => {
      const shoot = activeShoot;
      if (!shoot) return;
      const img = await getOrLoadImage(shoot);

      const patch = await regenerateOneAsset(shoot, key, img, {
        onStatusChange: (k, status, dataUrl) =>
          patchActiveAsset(shoot.shootId, k, status, dataUrl),
      });

      const assets = shoot.assets.map((a) =>
        a.key === key ? { ...a, ...patch } : a
      );
      const status = assets.some((a) => a.status === "failed")
        ? "needs-attention"
        : "completed";
      const finalShoot = { ...shoot, assets, status };

      setActiveShoot(finalShoot);
      await saveShootFull(finalShoot);
      const idx = await upsertIndexEntry(indexEntryFromShoot(finalShoot));
      setShoots(idx);
      if (patch.status === "failed") showToast("Regeneration failed — try again.");
    },
    [activeShoot, getOrLoadImage, patchActiveAsset, showToast]
  );

  const regenerateFailedFor = useCallback(
    async (shootId) => {
      let shoot =
        activeShoot && activeShoot.shootId === shootId
          ? activeShoot
          : await loadShootFull(shootId);
      if (!shoot) {
        showToast("Shoot not found.");
        return;
      }
      setActiveShoot(shoot);
      setScreen("detail");

      const failed = shoot.assets.filter((a) => a.status === "failed");
      if (failed.length === 0) {
        showToast("Nothing to regenerate.");
        return;
      }
      showToast(
        `Regenerating ${failed.length} asset${failed.length === 1 ? "" : "s"}…`
      );

      const img = await getOrLoadImage(shoot);
      let current = shoot;
      for (const a of failed) {
        const patch = await regenerateOneAsset(current, a.key, img, {
          onStatusChange: (k, status, dataUrl) =>
            patchActiveAsset(shootId, k, status, dataUrl),
        });
        current = {
          ...current,
          assets: current.assets.map((x) =>
            x.key === a.key ? { ...x, ...patch } : x
          ),
        };
      }
      current.status = current.assets.some((a) => a.status === "failed")
        ? "needs-attention"
        : "completed";

      setActiveShoot(current);
      await saveShootFull(current);
      const idx = await upsertIndexEntry(indexEntryFromShoot(current));
      setShoots(idx);
    },
    [activeShoot, getOrLoadImage, patchActiveAsset, showToast]
  );

  const deleteShoot = useCallback(
    async (shootId) => {
      await deleteShootStorage(shootId);
      showToast("Shoot deleted.");
      await openDashboard();
    },
    [openDashboard, showToast]
  );

  const downloadAsset = useCallback(
    (key) => {
      const shoot = activeShoot;
      if (!shoot) return;
      const asset = shoot.assets.find((a) => a.key === key);
      if (!asset || !asset.dataUrl) return;
      const a = document.createElement("a");
      a.href = asset.dataUrl;
      a.download = `${shoot.sku}_${asset.num}_${asset.suffix}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Downloading ${asset.label}…`);
    },
    [activeShoot, showToast]
  );

  const downloadZip = useCallback(async () => {
    const shoot = activeShoot;
    if (!shoot) return;
    const completed = shoot.assets.filter((a) => a.status === "completed");
    if (completed.length === 0) {
      showToast("No completed assets yet.");
      return;
    }
    showToast("Packaging ZIP…");
    try {
      const zip = new JSZip();
      const root = zip.folder(`${shoot.name.replace(/\s+/g, "-")}_${shoot.shootId}`);
      completed.forEach((a) => {
        const folder = root.folder(`${a.num}_${a.suffix}`);
        const base64 = a.dataUrl.split(",")[1];
        folder.file(`${shoot.sku}_${a.num}_${a.suffix}.jpg`, base64, {
          base64: true,
        });
        // Video generation disabled for now.
        // if (a.key === "MODEL_VIDEO") {
        //   folder.file(
        //     "README.txt",
        //     "This prototype simulates asset generation with a static frame. A production pipeline would export an MP4 and GIF here."
        //   );
        // }
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${shoot.name.replace(/\s+/g, "-")}_${shoot.shootId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast("ZIP ready.");
    } catch (e) {
      console.error(e);
      showToast("Could not build the ZIP — try again.");
    }
  }, [activeShoot, showToast]);

  const value = {
    screen,
    draft,
    activeShoot,
    shoots,
    toasts,
    goHome,
    openDashboard,
    uploadFile,
    startDraft,
    updateDraft,
    beginGeneration,
    openShoot,
    regenerateAsset,
    regenerateFailedFor,
    deleteShoot,
    downloadAsset,
    downloadZip,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}

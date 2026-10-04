const INDEX_KEY = "loupe:shoots-index";
const SHOOT_KEY = (id) => `loupe:shoot:${id}`;

const hasWindow = () => typeof window !== "undefined";

export async function getIndex() {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Could not read shoot index", e);
    return [];
  }
}

export async function setIndex(list) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Could not save shoot index", e);
  }
}

export async function saveShootFull(shoot) {
  if (!hasWindow()) return;
  try {
    // Strip non-serializable fields (e.g. cached Image elements) before persisting.
    const { img, ...persistable } = shoot;
    window.localStorage.setItem(
      SHOOT_KEY(shoot.shootId),
      JSON.stringify(persistable)
    );
  } catch (e) {
    console.error("Could not save shoot", e);
    throw e;
  }
}

export async function loadShootFull(shootId) {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(SHOOT_KEY(shootId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Could not load shoot", e);
    return null;
  }
}

export async function deleteShootStorage(shootId) {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(SHOOT_KEY(shootId));
  } catch (e) {
    /* noop */
  }
  const idx = await getIndex();
  await setIndex(idx.filter((s) => s.shootId !== shootId));
}

export async function upsertIndexEntry(entry) {
  const idx = await getIndex();
  const i = idx.findIndex((s) => s.shootId === entry.shootId);
  if (i >= 0) idx[i] = entry;
  else idx.unshift(entry);
  await setIndex(idx);
  return idx;
}

export function indexEntryFromShoot(shoot) {
  const completed = shoot.assets.filter((a) => a.status === "completed")
    .length;
  const failed = shoot.assets.filter((a) => a.status === "failed").length;
  let status = "completed";
  if (shoot.assets.some((a) => a.status === "pending" || a.status === "generating")) {
    status = "generating";
  } else if (failed > 0) {
    status = "needs-attention";
  }
  const frontAsset = shoot.assets.find((a) => a.key === "FRONT");
  return {
    shootId: shoot.shootId,
    name: shoot.name,
    sku: shoot.sku,
    category: shoot.category,
    createdAt: shoot.createdAt,
    thumb: (frontAsset && frontAsset.dataUrl) || shoot.originalImage,
    assetCount: shoot.assets.length,
    completed,
    failed,
    status,
  };
}

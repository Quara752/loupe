import { generateAsset } from "./canvasGen";
import { fetchBackdrop, supportsBackdrop } from "./aiBackdrop";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const BACKDROP_SIZES = { MODEL_WEARING: [440, 640] };

async function assetOpts(shoot, key) {
  const opts = {
    background: shoot.background,
    productName: shoot.name,
    collection: shoot.collection,
  };
  if (supportsBackdrop(key)) {
    const [width, height] = BACKDROP_SIZES[key] || [640, 640];
    opts.backdrop = await fetchBackdrop(key, {
      background: shoot.background,
      style: shoot.style,
      width,
      height,
    });
  }
  return opts;
}

/**
 * Regenerates a single asset for a shoot. Returns the status patch
 * ({status, dataUrl?}) for that asset. Reports live progress via
 * the onStatusChange callback so the UI can update immediately.
 */
export async function regenerateOneAsset(shoot, key, img, { onStatusChange } = {}) {
  onStatusChange && onStatusChange(key, "generating");
  await sleep(500 + Math.random() * 500);
  try {
    const result = await generateAsset(key, img, await assetOpts(shoot, key));
    onStatusChange && onStatusChange(key, "completed", result.dataUrl);
    return { status: "completed", dataUrl: result.dataUrl };
  } catch (e) {
    onStatusChange && onStatusChange(key, "failed");
    return { status: "failed" };
  }
}

/**
 * Runs the full ten-asset generation queue for a freshly created shoot.
 * Occasionally simulates a failed asset (never on the first item, so
 * progress is visibly under way before any failure can appear).
 * Returns the completed shoot object, ready to persist.
 */
export async function runFullQueue(shoot, img, { onStatusChange } = {}) {
  const assets = shoot.assets.map((a) => ({ ...a }));

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    onStatusChange && onStatusChange(asset.key, "generating");
    await sleep(420 + Math.random() * 520);

    const willFail = i > 0 && Math.random() < 0.1;
    if (willFail) {
      asset.status = "failed";
      onStatusChange && onStatusChange(asset.key, "failed");
    } else {
      try {
        const result = await generateAsset(asset.key, img, await assetOpts(shoot, asset.key));
        asset.status = "completed";
        asset.dataUrl = result.dataUrl;
        onStatusChange && onStatusChange(asset.key, "completed", result.dataUrl);
      } catch (e) {
        asset.status = "failed";
        onStatusChange && onStatusChange(asset.key, "failed");
      }
    }
  }

  const status = assets.some((a) => a.status === "failed")
    ? "needs-attention"
    : "completed";

  return { ...shoot, assets, status };
}

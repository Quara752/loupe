import { BG_HEX_MAP } from "./constants";

export function validateFile(file) {
  const okTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!okTypes.includes(file.type)) {
    return "Use a JPG, PNG, or WEBP image.";
  }
  if (file.size > 20 * 1024 * 1024) {
    return "Image is larger than 20MB — try a smaller file.";
  }
  return null;
}

export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function urlToImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawContain(ctx, img, x, y, w, h, padding = 0) {
  const iw = img.width,
    ih = img.height;
  const availW = w - padding * 2,
    availH = h - padding * 2;
  const scale = Math.min(availW / iw, availH / ih);
  const dw = iw * scale,
    dh = ih * scale;
  const dx = x + (w - dw) / 2,
    dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { dx, dy, dw, dh };
}

function drawCover(ctx, img, W, H) {
  const scale = Math.max(W / img.width, H / img.height);
  const dw = img.width * scale,
    dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Simulates one asset from the AI shoot pipeline by compositing the
 * user's real uploaded photo under a different studio treatment.
 * There is no generative model behind this — it's a stand-in so the
 * app flow (upload → configure → generate → review → export) works
 * end to end without a real image-generation backend.
 */
export async function generateAsset(key, sourceImg, opts = {}) {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      /* noop */
    }
  }

  const S = 640;
  const isSocial = key === "SOCIAL";
  // const isVideo = key === "MODEL_VIDEO";
  const isModel = key === "MODEL_WEARING";
  let W = S,
    H = S;
  if (isSocial) {
    W = 512;
    H = 640;
  }
  if (/* isVideo || */ isModel) {
    W = 440;
    H = 640;
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const backdrop = opts.backdrop || null;
  const bgHex = BG_HEX_MAP[opts.background] || "#F7F2E7";

  switch (key) {
    case "BOX": {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1E1A16");
      g.addColorStop(1, "#0F0C0A");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.fillStyle = "#272119";
      roundRect(ctx, W * 0.1, H * 0.42, W * 0.8, H * 0.46, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(198,161,91,0.4)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, W * 0.1, H * 0.42, W * 0.8, H * 0.46, 10);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(W / 2, H * 0.6, W * 0.22, H * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      drawContain(ctx, sourceImg, W * 0.2, H * 0.16, W * 0.6, H * 0.42, 8);
      break;
    }
    case "FRONT": {
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      const grd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        H * 0.1,
        W / 2,
        H / 2,
        H * 0.65
      );
      grd.addColorStop(0, "rgba(255,255,255,0.25)");
      grd.addColorStop(1, "rgba(0,0,0,0.06)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      drawContain(ctx, sourceImg, 0, 0, W, H, W * 0.14);
      break;
    }
    case "SIDE": {
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.transform(1, 0, 0.22, 0.96, 0, 0);
      ctx.translate(-W * 0.5, -H * 0.5);
      drawContain(ctx, sourceImg, W * 0.05, 0, W * 0.9, H, W * 0.16);
      ctx.restore();
      break;
    }
    case "ANGLE_45": {
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-0.09);
      ctx.translate(-W / 2, -H / 2);
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 16;
      drawContain(ctx, sourceImg, 0, 0, W, H, W * 0.17);
      ctx.restore();
      break;
    }
    case "TOP": {
      const g2 = ctx.createRadialGradient(
        W / 2,
        H / 2,
        10,
        W / 2,
        H / 2,
        H * 0.6
      );
      g2.addColorStop(0, "#EFE7D6");
      g2.addColorStop(1, "#D9CFB8");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(0.05);
      ctx.translate(-W / 2, -H / 2);
      drawContain(ctx, sourceImg, 0, 0, W, H, W * 0.15);
      ctx.restore();
      break;
    }
    case "MACRO": {
      ctx.save();
      ctx.filter = "blur(9px)";
      drawContain(ctx, sourceImg, -W * 0.3, -H * 0.3, W * 1.6, H * 1.6, 0);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, W * 0.42, H * 0.42, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, W, H);
      const iw = sourceImg.width,
        ih = sourceImg.height;
      const cropSize = Math.min(iw, ih) * 0.55;
      const sx = (iw - cropSize) / 2,
        sy = (ih - cropSize) / 2;
      ctx.drawImage(
        sourceImg,
        sx,
        sy,
        cropSize,
        cropSize,
        W * 0.14,
        H * 0.14,
        W * 0.72,
        H * 0.72
      );
      ctx.restore();
      ctx.strokeStyle = "rgba(198,161,91,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, W * 0.42, H * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "MODEL_WEARING": {
      const g3 = ctx.createLinearGradient(0, 0, 0, H);
      g3.addColorStop(0, "#EFE3CB");
      g3.addColorStop(1, "#D9C79E");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.fillStyle = "rgba(43,36,29,0.14)";
      ctx.beginPath();
      ctx.moveTo(W * 0.2, H);
      ctx.quadraticCurveTo(W * 0.15, H * 0.55, W * 0.5, H * 0.42);
      ctx.quadraticCurveTo(W * 0.85, H * 0.55, W * 0.8, H);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.28, W * 0.15, H * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      drawContain(ctx, sourceImg, W * 0.32, H * 0.36, W * 0.36, H * 0.16, 4);
      ctx.fillStyle = "rgba(43,36,29,0.5)";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("MOCK PREVIEW", 14, H - 16);
      break;
    }
    case "LIFESTYLE": {
      const g4 = ctx.createLinearGradient(0, 0, W, H);
      g4.addColorStop(0, "#EFE3CB");
      g4.addColorStop(0.5, "#E4D2A8");
      g4.addColorStop(1, "#D9C79E");
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, W, H);
      if (backdrop) drawCover(ctx, backdrop, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(W * 0.78, H * 0.24, 90, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(43,36,29,0.08)";
      ctx.beginPath();
      ctx.ellipse(W * 0.18, H * 0.82, 120, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-0.05);
      ctx.translate(-W / 2, -H / 2);
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 12;
      drawContain(ctx, sourceImg, W * 0.12, H * 0.14, W * 0.76, H * 0.72, 10);
      ctx.restore();
      break;
    }
    case "SOCIAL": {
      ctx.fillStyle = "#F7F2E7";
      ctx.fillRect(0, 0, W, H);
      drawContain(ctx, sourceImg, 0, 0, W, H * 0.72, 30);
      ctx.fillStyle = "#15120F";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      ctx.fillStyle = "#E0C079";
      ctx.font = "italic 500 22px Fraunces, serif";
      ctx.fillText(opts.productName || "THE ROYAL PIECE", 24, H * 0.72 + 40);
      ctx.fillStyle = "#EDE6D8";
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText(
        opts.collection || "Handcrafted Elegance",
        24,
        H * 0.72 + 64
      );
      ctx.strokeStyle = "#C6A15B";
      ctx.lineWidth = 1;
      roundRect(ctx, 24, H - 46, 96, 26, 100);
      ctx.stroke();
      ctx.fillStyle = "#C6A15B";
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.fillText("SHOP NOW", 42, H - 29);
      break;
    }
    // Video generation disabled for now.
    // case "MODEL_VIDEO": {
    //   const g5 = ctx.createLinearGradient(0, 0, 0, H);
    //   g5.addColorStop(0, "#1E1A16");
    //   g5.addColorStop(1, "#0F0C0A");
    //   ctx.fillStyle = g5;
    //   ctx.fillRect(0, 0, W, H);
    //   ctx.fillStyle = "rgba(198,161,91,0.12)";
    //   ctx.beginPath();
    //   ctx.moveTo(W * 0.22, H);
    //   ctx.quadraticCurveTo(W * 0.18, H * 0.5, W * 0.5, H * 0.38);
    //   ctx.quadraticCurveTo(W * 0.82, H * 0.5, W * 0.78, H);
    //   ctx.closePath();
    //   ctx.fill();
    //   drawContain(ctx, sourceImg, W * 0.3, H * 0.32, W * 0.4, H * 0.16, 4);
    //   ctx.fillStyle = "rgba(237,230,216,0.7)";
    //   ctx.font = "10.5px IBM Plex Mono, monospace";
    //   ctx.fillText("00:06", W - 52, H - 18);
    //   break;
    // }
    default:
      break;
  }

  return { dataUrl: canvas.toDataURL("image/jpeg", 0.87), key };
}

import { urlToImage } from "./canvasGen";

// Scene prompts per asset. The AI model paints only the empty scene; the
// user's real product photo is composited on top so stones and settings
// are never altered or hallucinated.
const SCENES = {
  BOX: "dark luxury velvet jewelry box interior, soft warm spotlight, empty, no jewelry",
  FRONT: "seamless studio backdrop, soft diffused lighting, subtle gradient, empty, no objects",
  SIDE: "seamless studio backdrop, soft side lighting, gentle shadows, empty, no objects",
  ANGLE_45: "polished studio surface with soft reflection and light shadows, empty, no objects",
  TOP: "flat lay overhead view of textured surface, soft natural light, empty, no objects",
  MODEL_WEARING: "elegant fashion portrait background, blurred warm neutral tones, soft bokeh, no people",
  LIFESTYLE: "luxury vanity table with silk fabric and flowers, warm window light, shallow depth of field, no jewelry, no people",
};

export function supportsBackdrop(key) {
  return key in SCENES;
}

/**
 * Returns an Image of an AI-generated backdrop, or null on any failure
 * (callers fall back to the built-in canvas backdrop).
 */
export async function fetchBackdrop(key, { background, style, width, height }) {
  if (!SCENES[key]) return null;
  const tone = background ? `, ${background.toLowerCase()} color palette` : "";
  const st = style ? `, ${style.toLowerCase()} style` : "";
  const prompt = `${SCENES[key]}${tone}${st}, professional product photography, high quality`;
  try {
    const res = await fetch("/api/backdrop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, width, height }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    try {
      return await urlToImage(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    return null;
  }
}

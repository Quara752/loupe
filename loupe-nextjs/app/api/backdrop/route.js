// Server-side proxy to a free AI image model (Pollinations.ai — no API key).
// Keeping this on the server lets us swap providers without touching the UI.
export const runtime = "nodejs";

const MODEL = process.env.AI_IMAGE_MODEL || "flux";

export async function POST(request) {
  try {
    const { prompt, width = 640, height = 640, seed } = await request.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 800) {
      return Response.json({ error: "Invalid prompt" }, { status: 400 });
    }
    const w = Math.min(Math.max(parseInt(width) || 640, 256), 1024);
    const h = Math.min(Math.max(parseInt(height) || 640, 256), 1024);
    const params = new URLSearchParams({
      width: String(w),
      height: String(h),
      model: MODEL,
      nologo: "true",
      seed: String(seed ?? Math.floor(Math.random() * 1e6)),
    });
    if (process.env.POLLINATIONS_TOKEN) {
      params.set("token", process.env.POLLINATIONS_TOKEN);
    }
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?${params}`;

    const upstream = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!upstream.ok) {
      return Response.json(
        { error: `Provider error ${upstream.status}` },
        { status: 502 }
      );
    }
    const type = upstream.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) {
      return Response.json({ error: "Provider returned non-image" }, { status: 502 });
    }
    return new Response(await upstream.arrayBuffer(), {
      headers: { "Content-Type": type, "Cache-Control": "no-store" },
    });
  } catch (e) {
    return Response.json({ error: "Generation failed" }, { status: 502 });
  }
}

import { MAX_PHOTO_BYTES } from "../imagekit-upload";

const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];
const HEIC_EXT = /\.(heic|heif)$/i;
const WEBP_QUALITY = 0.85;
/** Longest side after downscaling; plenty for a catalog photo. */
const MAX_DIMENSION = 3000;

/** iPhone photos: browsers don't render them, and some report no MIME type at all. */
export function isHeic(file: File) {
  return HEIC_TYPES.includes(file.type.toLowerCase()) || HEIC_EXT.test(file.name);
}

const extFor = (type: string) =>
  type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";

const baseName = (name: string) => name.replace(/\.[^./\\]+$/, "") || "foto";

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Downscales and re-encodes an image as WebP (JPEG where the browser can't
 * encode WebP), shrinking further until it fits the upload limit.
 */
async function reencode(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo preparar la imagen.");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
      // Safari and others silently return PNG when they can't encode WebP.
      if (!blob || blob.type !== "image/webp")
        blob = await canvasToBlob(canvas, "image/jpeg", WEBP_QUALITY);
      if (!blob) throw new Error("No se pudo comprimir la imagen.");

      if (blob.size <= MAX_PHOTO_BYTES || attempt === 4)
        return new File([blob], `${baseName(file.name)}.${extFor(blob.type)}`, {
          type: blob.type,
          lastModified: file.lastModified,
        });
      scale *= 0.8;
    }
  } finally {
    bitmap.close();
  }
  return file;
}

/**
 * Turns an iPhone .heic/.heif photo into a .webp file (quality 0.85) so it can
 * be previewed and uploaded. Photos that are still too big for the upload limit
 * (or that came out as PNG) are downscaled and re-encoded. Other formats pass
 * through untouched. Rejects when a HEIC file can't be converted.
 */
export async function processVehicleImage(file: File): Promise<File> {
  let out = file;

  if (isHeic(file)) {
    // heic2any touches the DOM when it loads, so it is only imported on demand.
    const { default: heic2any } = await import("heic2any");
    const result = await heic2any({
      blob: file,
      toType: "image/webp",
      quality: WEBP_QUALITY,
    });
    // A multi-frame HEIC returns one blob per frame; the first is the photo.
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob) throw new Error("La conversión no devolvió ninguna imagen.");
    const type = blob.type || "image/webp";
    out = new File([blob], `${baseName(file.name)}.${extFor(type)}`, {
      type,
      lastModified: file.lastModified,
    });
    // Browsers that can't encode WebP return a huge PNG: re-encode it.
    if (type !== "image/webp") out = await reencode(out);
  }

  if (out.size > MAX_PHOTO_BYTES && out.type.startsWith("image/"))
    out = await reencode(out);
  return out;
}

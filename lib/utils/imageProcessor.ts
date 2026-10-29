const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];
const HEIC_EXT = /\.(heic|heif)$/i;
const WEBP_QUALITY = 0.85;

/** iPhone photos: browsers don't render them, and some report no MIME type at all. */
export function isHeic(file: File) {
  return HEIC_TYPES.includes(file.type.toLowerCase()) || HEIC_EXT.test(file.name);
}

/**
 * Turns an iPhone .heic/.heif photo into a .webp file (quality 0.85) so it can
 * be previewed and uploaded; other formats (jpg, png, webp) pass through as is.
 * Rejects when a HEIC file can't be converted.
 */
export async function processVehicleImage(file: File): Promise<File> {
  if (!isHeic(file)) return file;

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

  // Browsers that can't encode WebP hand back another image type (e.g. PNG):
  // name the file after what it really is.
  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
  const name = file.name.replace(HEIC_EXT, "") || "foto";
  return new File([blob], `${name}.${ext}`, {
    type: blob.type || "image/webp",
    lastModified: file.lastModified,
  });
}

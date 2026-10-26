import { upload } from "@imagekit/next";
import { auth } from "./firebase";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Checks a file before uploading; returns an error message or null. */
export function photoError(file: File) {
  if (!file.type.startsWith("image/")) return "El archivo tiene que ser una imagen.";
  if (file.size > MAX_PHOTO_BYTES) return "La imagen pesa más de 10 MB.";
  return null;
}

/** Uploads one image to ImageKit, signed by /api/imagekit-auth. Returns its URL. */
export async function uploadPhoto(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  const res = await fetch("/api/imagekit-auth", {
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
  });
  if (!res.ok) throw new Error("No se pudo autorizar la subida.");
  const { token, expire, signature, publicKey } = await res.json();
  const result = await upload({
    file,
    fileName: file.name,
    folder,
    token,
    expire,
    signature,
    publicKey,
    onProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  });
  if (!result.url) throw new Error("ImageKit no devolvió la URL de la imagen.");
  return result.url;
}

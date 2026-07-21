// Converts an image File to WebP on the client before upload.
// Falls back to the original file on any error or for non-convertible types,
// so callers can safely use the result without extra checks.
export async function toWebp(file, { quality = 0.82, maxWidth = 1600 } = {}) {
  // Not a file / not an image → return as-is
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  // Animated GIFs would lose their animation if flattened to webp → keep original
  if (file.type === "image/gif") return file;
  // Already webp → nothing to do
  if (file.type === "image/webp") return file;

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob) return file; // browser refused webp → fall back

    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newName, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    return file; // any failure → upload the original
  }
}

export default toWebp;

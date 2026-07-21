import { toWebp } from "./imageToWebp";

// Shared ImgBB key used across the app's upload flows.
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;
const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

// Converts an image File to WebP (via toWebp) and uploads it to ImgBB,
// returning the hosted URL. Throws on failure so callers can toast an error.
export async function uploadImage(file) {
  if (!file) throw new Error("No file provided");

  const optimized = await toWebp(file);

  const data = new FormData();
  data.append("image", optimized);

  const res = await fetch(IMGBB_UPLOAD_URL, { method: "POST", body: data });
  const json = await res.json();

  if (!json?.success || !json?.data?.url) {
    throw new Error("Image upload failed");
  }
  return json.data.url;
}

export default uploadImage;

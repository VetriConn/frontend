import type { ImageLoaderProps } from "next/image";

/**
 * Image loader that bypasses Next.js's optimizer for Cloudinary URLs and
 * uses Cloudinary's own transformations instead.
 *
 * Why bypass:
 *   - Cloudinary already serves resized + format-optimized output.
 *   - Routing Cloudinary URLs through `/_next/image` adds an extra hop and
 *     a 504 if Cloudinary is slow.
 *
 * For non-Cloudinary URLs (e.g. local `/images/...`), it falls back to a
 * plain pass-through so Next's default behavior continues for those.
 *
 * Wired up in `next.config.ts` via `images.loaderFile`. Next.js requires
 * a default export here.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Local / relative URLs: let the browser handle them natively.
  if (src.startsWith("/")) return src;

  if (!src.includes("res.cloudinary.com")) {
    // Not a Cloudinary URL — return as-is. Next will hit it directly because
    // we set `unoptimized` for these via `<Image unoptimized>` or by config.
    return src;
  }

  // Inject Cloudinary transformations after `/upload/` if not already there.
  const transforms = [`w_${width}`, `q_${quality ?? "auto"}`, "f_auto"];
  const transformPart = transforms.join(",");

  return src.replace(
    /\/upload\/(?!.*?\/)/,
    `/upload/${transformPart}/`,
  );
}

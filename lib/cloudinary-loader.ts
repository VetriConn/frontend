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
 * Transformations are inserted directly after `/upload/`, which is valid
 * ahead of a version (`/v1712.../`) or a folder path. Any transformation
 * segment already present is preserved except for `w_`/`q_`/`f_`, which
 * this loader owns — Next.js drives those via its srcset widths. That
 * makes the function idempotent: feeding its own output back in is a no-op.
 *
 * Wired up in `next.config.ts` via `images.loaderFile`. Next.js requires
 * a default export here.
 */

const UPLOAD_MARKER = "/upload/";

/**
 * Cloudinary transformation parameter keys. Needed to tell a transformation
 * segment apart from the other things that can sit right after `/upload/`:
 * a version (`v1712345`) or a folder name (`company_logos`).
 */
const TRANSFORM_KEYS = new Set([
  "a", "ac", "ar", "b", "bo", "br", "c", "co", "cs", "d", "dl", "dn", "dpr",
  "du", "e", "eo", "f", "fl", "fn", "g", "h", "ki", "l", "o", "p", "pg", "q",
  "r", "so", "sp", "t", "u", "vc", "vs", "w", "x", "y", "z",
]);

/** Params this loader owns; any existing copies are replaced, not chained. */
const OWNED_PARAMS = /^(?:w|q|f)_/;

/**
 * True when `segment` is a Cloudinary transformation segment such as
 * `w_640,c_fill,g_face`. Every comma-separated part must be a known
 * `key_value` pair, so `v1712345` and `company_logos` both return false.
 */
function isTransformSegment(segment: string): boolean {
  if (!segment) return false;

  return segment.split(",").every((part) => {
    const separator = part.indexOf("_");
    if (separator <= 0) return false;
    return TRANSFORM_KEYS.has(part.slice(0, separator));
  });
}

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

  const markerIndex = src.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) {
    // Non-upload delivery type (e.g. `/image/fetch/`) — nothing to inject.
    return src;
  }

  const prefix = src.slice(0, markerIndex + UPLOAD_MARKER.length);
  const rest = src.slice(markerIndex + UPLOAD_MARKER.length);

  const slashIndex = rest.indexOf("/");
  const firstSegment = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const remainder = slashIndex === -1 ? "" : rest.slice(slashIndex + 1);

  // A transformation segment is never the last segment — the public ID always
  // follows it. Requiring a remainder keeps a file literally named
  // `w_banner.jpg` from being mistaken for a transformation and dropped.
  const existing =
    slashIndex !== -1 && isTransformSegment(firstSegment)
      ? firstSegment.split(",").filter((part) => !OWNED_PARAMS.test(part))
      : null;

  const transforms = [
    `w_${width}`,
    `q_${quality ?? "auto"}`,
    "f_auto",
    ...(existing ?? []),
  ];

  // When we consumed an existing transformation segment, drop it from the tail.
  const tail = existing === null ? rest : remainder;

  return `${prefix}${transforms.join(",")}/${tail}`;
}

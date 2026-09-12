/**
 * The image editor's arithmetic and encoding, with no React in it.
 *
 * ProfilePhotoModal did all of this inside `imgEl.onload`, between ctx.save()
 * and ctx.restore() (ProfilePhotoModal.tsx:271-366). jsdom has no 2D context,
 * so not one line of it could be reached by a test, and the parts that were
 * wrong were the arithmetic: pan offsets scaled against a frame assumed to be
 * 384px wide, and a cover fit written only for a square canvas. Separating
 * the maths from the fifteen straight-line ctx calls is what makes the maths
 * assertable, which is the whole reason this file exists.
 *
 * The only DOM touched here is an offscreen canvas and an Image, and only
 * inside renderEditedImage, loadImageElement and toLocalObjectUrl.
 */

/**
 * The formats every server allow-list in the codebase already permits: the
 * signed profile_picture preset allows jpg,jpeg,png,webp and the company
 * multer fileFilter allows the same four. Not a prop, because no caller
 * differs. CompanyProfileEditor's accept="image/*" is wider than its own
 * server, which is how a picked GIF becomes a 500 today.
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

/** Value for the file input's accept attribute. */
export const IMAGE_ACCEPT_ATTRIBUTE: string = ACCEPTED_IMAGE_TYPES.join(",");

/** JPEG encode quality. One value, one name. Matches today's export. */
export const JPEG_QUALITY = 0.95;

/**
 * Narrows a File's reported MIME to something renderEditedImage will accept.
 *
 * validateImageFile returning null already proves the type is on the list,
 * but it proves it to the reader and not to the compiler, and the alternative
 * at the call site is a cast that would survive someone widening this array.
 */
export function isAcceptedImageType(type: string): type is AcceptedImageType {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

export type ImageRejection = "too-large" | "unsupported-type" | "empty";

/** Null means the file passed. Client-side convenience, never enforcement. */
export function validateImageFile(
  file: File,
  maxBytes: number,
): ImageRejection | null {
  // Type first, because it is the only rejection the user cannot fix by
  // picking a different copy of the same picture, and because the picker is
  // where a GIF gets in. Then empty, because a zero-byte file has no size to
  // compare: some Android pickers hand back a placeholder for a photo still
  // syncing, and the server answers that with "Blocked upload: empty file".
  if (!isAcceptedImageType(file.type)) return "unsupported-type";
  if (file.size === 0) return "empty";
  // Strictly greater: multer refuses above the limit, not at it, so a file of
  // exactly maxBytes has to pass both sides or the client refuses an upload
  // the server would have taken.
  if (file.size > maxBytes) return "too-large";
  return null;
}

/**
 * The ceiling as a person reads it. The three real caps are whole megabytes;
 * the decimal is only there so a caller passing something else does not get
 * "2.86102294921875 MB".
 */
function formatByteCeiling(maxBytes: number): string {
  const megabytes = maxBytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)} MB`;
}

/** The one place the rejection wording is written. No em dashes. */
export function imageRejectionMessage(
  rejection: ImageRejection,
  maxBytes: number,
): string {
  switch (rejection) {
    case "too-large":
      // The limit is named rather than implied, because it differs per asset
      // and "too large" on its own leaves the user guessing at the target.
      return `That image is larger than ${formatByteCeiling(maxBytes)}. Please choose a smaller file.`;
    case "unsupported-type":
      return "That file type is not supported. Please choose a JPG, PNG or WebP image.";
    case "empty":
      return "That file is empty. Please choose another image.";
  }
}

/** Pixel size of the exported image. Its ratio is also the crop frame's. */
export interface ImageOutputSize {
  width: number;
  height: number;
}

export interface ImageTransform {
  /** 1 is cover fit, the smallest value that still fills the frame. Max 3. */
  zoom: number;
  /** Degrees, -180 to 180. */
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  /** Pan, in CSS pixels of the on-screen frame, already clamped. */
  offsetX: number;
  offsetY: number;
}

export type ImageFilterPreset =
  | "none"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "high-contrast";

export interface ImageAdjustments {
  preset: ImageFilterPreset;
  /** 50 to 150, where 100 leaves the image alone. */
  brightness: number;
  contrast: number;
  saturation: number;
}

export const IDENTITY_TRANSFORM: ImageTransform = {
  zoom: 1,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  offsetX: 0,
  offsetY: 0,
};

export const IDENTITY_ADJUSTMENTS: ImageAdjustments = {
  preset: "none",
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

/**
 * True when the canvas honours ctx.filter. Older Safari ignores it without
 * complaining, which is why the preview currently shows filters the saved
 * file does not have. Where this is false the dialog hides the Filter and
 * Adjust tabs rather than previewing something it cannot save.
 */
let cachedFilterSupport: boolean | null = null;

export function canvasFiltersSupported(): boolean {
  if (cachedFilterSupport !== null) return cachedFilterSupport;
  // Not cached on the server: the answer is a property of the browser, and
  // caching "false" during prerender would follow the bundle to a browser
  // that supports filters perfectly well.
  if (typeof document === "undefined") return false;

  const probe = document.createElement("canvas").getContext("2d");
  // A browser that ignores the property leaves it reading "none" instead of
  // throwing, so support has to be read back rather than assumed from the
  // assignment succeeding.
  if (probe) {
    probe.filter = "blur(1px)";
    cachedFilterSupport = probe.filter === "blur(1px)";
  } else {
    cachedFilterSupport = false;
  }
  return cachedFilterSupport;
}

/**
 * The extras each preset adds after the sliders. A record rather than the
 * if/else ladder it replaces, so adding a preset to ImageFilterPreset without
 * giving it a chain is a compile error instead of a silently unfiltered tab.
 */
const PRESET_FILTERS: Record<ImageFilterPreset, string> = {
  none: "",
  grayscale: "grayscale(100%)",
  sepia: "sepia(80%)",
  warm: "sepia(30%) saturate(120%) hue-rotate(-10deg)",
  cool: "saturate(90%) hue-rotate(10deg)",
  "high-contrast": "contrast(140%) brightness(105%)",
};

/**
 * One filter chain, built once, read by both the preview and the export.
 *
 * It was typed out twice by hand, at ProfilePhotoModal.tsx:260 and again at
 * :306, and the two agreed only because nobody had edited one of them yet.
 * A preview that lies about the file it is about to write is the worst
 * version of this bug, because it looks like it worked.
 */
export function buildFilterCss(adjustments: ImageAdjustments): string {
  const sliders = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
  const preset = PRESET_FILTERS[adjustments.preset];
  // Preset last, so its own contrast and saturation compose on top of the
  // sliders rather than being overwritten by them.
  return preset ? `${sliders} ${preset}` : sliders;
}

/**
 * Keeps the image covering the frame so it cannot be panned off and saved
 * blank, which it can be today: offsetX and offsetY are set straight from the
 * pointer delta with no bound (ProfilePhotoModal.tsx:236-240), so dragging
 * past the edge and pressing Save writes a transparent square.
 *
 * Rotation is deliberately not part of this. The offsets are recorded in the
 * frame's own axes, and clamping against a rotated bounding box would make
 * the image jump the moment the rotation slider moved.
 */
export function clampPan(
  offset: { x: number; y: number },
  frame: ImageOutputSize,
  natural: ImageOutputSize,
  zoom: number,
): { x: number; y: number } {
  const coverScale = Math.max(
    frame.width / natural.width,
    frame.height / natural.height,
  );
  const displayedWidth = natural.width * coverScale * zoom;
  const displayedHeight = natural.height * coverScale * zoom;

  // Half of what hangs past each edge, which is exactly how far the image can
  // travel before the frame stops being covered. At zoom 1 one axis is always
  // 0, so a cover-fitted image does not move at all on its tight axis.
  const overhangX = Math.max(0, (displayedWidth - frame.width) / 2);
  const overhangY = Math.max(0, (displayedHeight - frame.height) / 2);

  return {
    x: Math.min(overhangX, Math.max(-overhangX, offset.x)),
    y: Math.min(overhangY, Math.max(-overhangY, offset.y)),
  };
}

export interface DrawGeometry {
  translateX: number;
  translateY: number;
  rotateRadians: number;
  scaleX: 1 | -1;
  scaleY: 1 | -1;
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
}

export interface GeometryInput {
  transform: ImageTransform;
  /** naturalWidth and naturalHeight of the decoded source. */
  source: ImageOutputSize;
  /** Measured CSS size of the on-screen crop frame, which is the frame the
   *  pan offsets were recorded against. Measured, never assumed. */
  frame: ImageOutputSize;
  output: ImageOutputSize;
}

/**
 * The whole of the export math, with no canvas in sight. Pulled out because
 * jsdom has no 2D context, so anything computed between ctx.save() and
 * ctx.restore() can never be asserted on.
 *
 * Two corrections against the original, both of which the old code got away
 * with only because it had one caller and that caller was square:
 *
 *  - Pan was multiplied by `canvas.width / (imageRef.current?.clientWidth ||
 *    384)` (ProfilePhotoModal.tsx:315-318). A frame not yet measured, or
 *    simply not 384px, moved the exported image by the wrong distance, so
 *    what the user dragged into view is not what got written.
 *  - Cover fit was `canvas.height * zoom` scaled by the source aspect
 *    (:332-339), which lands on cover when the canvas is square and leaves a
 *    1600x300 banner with transparent bars down both sides when it is not.
 *    One max() covers both axes and reproduces the old numbers exactly
 *    wherever the output is square.
 */
export function computeDrawGeometry(input: GeometryInput): DrawGeometry {
  const { transform, source, frame, output } = input;

  // The smallest scale that still fills the output in both axes. This is what
  // makes zoom 1 the floor: below it the frame would show through.
  const coverScale = Math.max(
    output.width / source.width,
    output.height / source.height,
  );
  const drawWidth = source.width * coverScale * transform.zoom;
  const drawHeight = source.height * coverScale * transform.zoom;

  return {
    // Pan was recorded in CSS pixels of the on-screen frame, so it converts
    // to output pixels by the ratio of the two, taken per axis because a
    // banner's frame and output do not share one ratio.
    translateX:
      output.width / 2 + transform.offsetX * (output.width / frame.width),
    translateY:
      output.height / 2 + transform.offsetY * (output.height / frame.height),
    rotateRadians: (transform.rotation * Math.PI) / 180,
    scaleX: transform.flipHorizontal ? -1 : 1,
    scaleY: transform.flipVertical ? -1 : 1,
    // Drawn around the origin, because the translate above has already put
    // the origin where the centre of the image belongs. This is also what
    // keeps a flip from moving the image: negating an axis about its own
    // centre is a mirror, negating it about a corner is a mirror plus a jump.
    drawX: -drawWidth / 2,
    drawY: -drawHeight / 2,
    drawWidth,
    drawHeight,
  };
}

/** Wording for the three ways a source can fail to become a file. */
const CANNOT_DECODE_MESSAGE =
  "That image could not be opened. Please choose another file.";
const CANNOT_FETCH_MESSAGE =
  "The image on file could not be loaded for editing. Please try again.";
const CANNOT_ENCODE_MESSAGE =
  "That image could not be saved. Please try again.";

/** Decodes, or rejects. Attaches onerror before assigning src. */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Both handlers before src, and onerror at all. The original assigns src
    // and then attaches only onload (ProfilePhotoModal.tsx:293-295), so a
    // source that cannot decode fires nothing anyone is listening for: no
    // spinner stops, no message appears, Save simply does nothing.
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(CANNOT_DECODE_MESSAGE));
    // No crossOrigin dance. Every source reaching here is an object URL,
    // which is same-origin by construction; toLocalObjectUrl is what keeps
    // remote images from tainting the canvas.
    image.src = src;
  });
}

/**
 * Copies a remote image into an object URL so the canvas is never tainted.
 * Rejects on failure, so re-editing an image already on file reports a
 * problem instead of leaving Save inert: today the failure is console.error'd
 * and execution falls through to a bare `return`
 * (ProfilePhotoModal.tsx:282-286), which is a Save button that does nothing,
 * silently, for as long as the dialog stays open. The caller revokes the URL.
 */
export async function toLocalObjectUrl(remoteUrl: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(remoteUrl);
  } catch {
    // fetch rejects with a bare "Failed to fetch" on a network error, and
    // this message is rendered to the user verbatim.
    throw new Error(CANNOT_FETCH_MESSAGE);
  }
  if (!response.ok) throw new Error(CANNOT_FETCH_MESSAGE);
  return URL.createObjectURL(await response.blob());
}

/**
 * The two formats this module ever writes. WebP is readable but never
 * written: toBlob quietly encodes PNG when it cannot produce the type asked
 * for, which would put PNG bytes behind a .webp name, and matching the name
 * to the bytes is the one job renameToMatchBytes exists to do.
 */
type EncodedImageType = "image/jpeg" | "image/png";

export interface RenderEditedImageArgs {
  /** Always an object URL. Remote sources go through toLocalObjectUrl. */
  sourceUrl: string;
  /** MIME of the original, which decides whether alpha is even possible. */
  sourceType: AcceptedImageType;
  /** Measured CSS size of the on-screen crop frame. */
  frame: ImageOutputSize;
  output: ImageOutputSize;
  transform: ImageTransform;
  adjustments: ImageAdjustments;
  /** Base name. The extension is rewritten to match the encoded bytes. */
  sourceFileName: string;
}

/** Any pixel short of full opacity is enough to force PNG. */
function hasTransparentPixel(
  ctx: CanvasRenderingContext2D,
  size: ImageOutputSize,
): boolean {
  const { data } = ctx.getImageData(0, 0, size.width, size.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/**
 * Format is derived from what was composited, never configured.
 *
 * The alternative, a `format` prop, is the knob that would have to be set
 * correctly by every future caller and would be wrong the first time somebody
 * uploaded a photograph through a call site set to PNG.
 */
function chooseEncoding(
  ctx: CanvasRenderingContext2D,
  sourceType: AcceptedImageType,
  output: ImageOutputSize,
): EncodedImageType {
  // A JPEG has no alpha to preserve, so the scan can only come back false and
  // reading back 1200x1200 pixels to learn that is 1.4M iterations of nothing.
  if (sourceType === "image/jpeg") return "image/jpeg";
  // A logo with a transparent background has to stay PNG or it acquires a
  // black one; a photograph saved as PNG becomes several megabytes and trips
  // the very ceiling this dialog checks against.
  return hasTransparentPixel(ctx, output) ? "image/png" : "image/jpeg";
}

/**
 * The bytes decide the extension, not the file the user picked.
 *
 * A WebP source re-encoded as JPEG keeps its .webp name otherwise, and the
 * company route checks the extension against jpg/jpeg/png/webp and, quite
 * separately, the declared MIME against the file's magic bytes
 * (backend/src/controllers/company/index.ts:354-358,
 * backend/src/utils/uploadSecurity.ts:145-172). Rewriting it here is what
 * keeps all three saying the same thing.
 */
function renameToMatchBytes(
  sourceFileName: string,
  encoded: EncodedImageType,
): string {
  // Only a trailing extension goes; "acme.logo.v2.webp" keeps its dots.
  const base = sourceFileName.replace(/\.[^./\\]+$/, "").trim();
  return `${base || "image"}.${encoded === "image/png" ? "png" : "jpg"}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  encoded: EncodedImageType,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // toBlob hands back null rather than throwing when it cannot encode.
        // The original treats that as success and calls onSave with the
        // untouched original file (ProfilePhotoModal.tsx:359), so a failed
        // encode uploads the uncropped, unrotated, unfiltered picture and
        // reports it as saved.
        if (blob) resolve(blob);
        else reject(new Error(CANNOT_ENCODE_MESSAGE));
      },
      encoded,
      // PNG ignores the quality argument; passing it anyway would read as if
      // the two formats were tuned together.
      encoded === "image/jpeg" ? JPEG_QUALITY : undefined,
    );
  });
}

/**
 * Composites onto a transparent canvas and encodes. Format is derived, not
 * configured: a JPEG source cannot carry alpha so it skips the check and
 * encodes JPEG; a PNG or WebP source is scanned once for any pixel below
 * full opacity and encodes PNG if it finds one, JPEG otherwise. So a
 * transparent logo keeps its alpha and a photograph does not become a
 * several megabyte PNG. The filename extension is rewritten to match the
 * bytes, because the company route compares extension, declared MIME and
 * magic bytes and rejects a mismatch. Resolves only once the bytes exist.
 *
 * That last sentence is the point of the whole function being async. Today's
 * handleSave is declared async and returns the instant it registers
 * imgEl.onload (ProfilePhotoModal.tsx:295-366), so the caller's await is
 * satisfied before the image has even decoded and the uploading flag is
 * driven from inside a callback nobody can wait on.
 */
export async function renderEditedImage(
  args: RenderEditedImageArgs,
): Promise<File> {
  const image = await loadImageElement(args.sourceUrl);

  const canvas = document.createElement("canvas");
  canvas.width = args.output.width;
  canvas.height = args.output.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(CANNOT_ENCODE_MESSAGE);

  // Left transparent on purpose. Filling white first is the usual reflex and
  // it would put an opaque background behind every logo, which also makes the
  // alpha scan below unable to ever find anything.
  ctx.filter = buildFilterCss(args.adjustments);

  const geometry = computeDrawGeometry({
    transform: args.transform,
    source: { width: image.naturalWidth, height: image.naturalHeight },
    frame: args.frame,
    output: args.output,
  });

  ctx.save();
  ctx.translate(geometry.translateX, geometry.translateY);
  ctx.rotate(geometry.rotateRadians);
  ctx.scale(geometry.scaleX, geometry.scaleY);
  ctx.drawImage(
    image,
    geometry.drawX,
    geometry.drawY,
    geometry.drawWidth,
    geometry.drawHeight,
  );
  ctx.restore();

  const encoded = chooseEncoding(ctx, args.sourceType, args.output);
  const blob = await canvasToBlob(canvas, encoded);

  return new File([blob], renameToMatchBytes(args.sourceFileName, encoded), {
    type: encoded,
    lastModified: Date.now(),
  });
}

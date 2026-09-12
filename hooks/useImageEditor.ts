"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IDENTITY_ADJUSTMENTS,
  IDENTITY_TRANSFORM,
  buildFilterCss,
  canvasFiltersSupported,
  clampPan,
  imageRejectionMessage,
  isAcceptedImageType,
  loadImageElement,
  renderEditedImage,
  validateImageFile,
  type AcceptedImageType,
  type ImageAdjustments,
  type ImageOutputSize,
  type ImageTransform,
} from "@/lib/image/imageEdit";

/**
 * The state and lifecycle behind picking, editing and committing one image.
 *
 * Headless on purpose. The 938-line ProfilePhotoModal this replaces mixed four
 * concerns in one file, and the consequence was not untidiness but two defects
 * that nothing could catch:
 *
 *  - `handleSave` was `async` and returned the moment it registered an
 *    `onload`, so the caller's `await` resolved before any bytes existed. The
 *    "uploading" flag was driven from inside a callback instead, which is why
 *    it could be wrong in both directions. `commit()` here resolves only once
 *    the render AND the caller's submit have both settled.
 *  - the pan offsets were never clamped, so an image could be dragged clear of
 *    the frame and saved as an empty rectangle.
 *
 * It owns no markup, no copy and no network call. Which endpoint receives the
 * file is the caller's business, and deliberately so: the avatar uploads
 * straight to Cloudinary with a signature, while company assets go multipart
 * through our own API so the server can inspect the bytes. A component that
 * chose the transport could not serve both.
 */

export type EditorStage = "empty" | "editing" | "rendering" | "submitting";

export interface UseImageEditorOptions {
  output: ImageOutputSize;
  /**
   * Largest file this caller's endpoint accepts. Required, with no default,
   * because the real ceilings are 3MB, 5MB and 8MB: any default would be
   * wrong for two of the three, which is exactly how CompanyProfileEditor
   * ended up refusing valid banners and accepting oversized logos.
   */
  maxBytes: number;
  currentImageUrl?: string;
  /** Must throw on failure and must not raise its own toast. */
  onSubmit: (file: File) => Promise<void>;
}

export interface UseImageEditorResult {
  stage: EditorStage;
  transform: ImageTransform;
  adjustments: ImageAdjustments;
  previewSrc: string | null;
  /** naturalWidth/naturalHeight of the pending source, or null. */
  naturalSize: ImageOutputSize | null;
  /**
   * Whether the image overhangs the frame in either axis.
   *
   * False means panning is physically impossible: a square photo in a square
   * frame at zoom 1 covers it exactly, so there is nothing outside the crop
   * to bring into it. The dialog says so instead of inviting a drag that
   * cannot move.
   */
  canPan: boolean;
  frameRef: React.RefObject<HTMLDivElement | null>;
  error: string | null;
  filterCss: string;
  canApplyFilters: boolean;
  selectFile: (file: File) => void;
  editCurrentImage: () => Promise<void>;
  setTransform: (patch: Partial<ImageTransform>) => void;
  setAdjustments: (patch: Partial<ImageAdjustments>) => void;
  resetAll: () => void;
  resetAdjustments: () => void;
  commit: () => Promise<boolean>;
  clear: () => void;
}

/** The decoded source, kept together because the export needs all three. */
interface PendingSource {
  url: string;
  type: AcceptedImageType;
  name: string;
  /** naturalWidth/naturalHeight, needed to clamp the pan. */
  natural: ImageOutputSize;
}

/** The last path segment, or a plain fallback. Extension is rewritten later. */
function fileNameFromUrl(url: string): string {
  const withoutQuery = url.split(/[?#]/)[0];
  const last = withoutQuery.slice(withoutQuery.lastIndexOf("/") + 1);
  return last || "image";
}

export function useImageEditor({
  output,
  maxBytes,
  currentImageUrl,
  onSubmit,
}: UseImageEditorOptions): UseImageEditorResult {
  const [stage, setStage] = useState<EditorStage>("empty");
  const [source, setSource] = useState<PendingSource | null>(null);
  const [transform, setTransformState] =
    useState<ImageTransform>(IDENTITY_TRANSFORM);
  const [adjustments, setAdjustmentsState] =
    useState<ImageAdjustments>(IDENTITY_ADJUSTMENTS);
  const [error, setError] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement | null>(null);

  /**
   * Revoking is keyed on the URL rather than done inside every setter, so
   * there is one place that can leak and it is this one. The cleanup runs on
   * replacement and on unmount, which is the whole lifetime of an object URL.
   */
  const sourceUrl = source?.url ?? null;
  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  /**
   * A capability probe, not state. Older Safari accepts `ctx.filter` and
   * silently ignores it, which is how the current editor shows a filtered
   * preview and then saves an unfiltered file. Where it is unsupported the
   * dialog hides the controls rather than previewing something it cannot
   * deliver.
   *
   * Read lazily: this touches a canvas, so it must not run during a server
   * render. The dialog only mounts on a user action, well after hydration.
   */
  const [canApplyFilters] = useState<boolean>(() =>
    typeof document === "undefined" ? false : canvasFiltersSupported(),
  );

  const filterCss = useMemo(
    () => buildFilterCss(adjustments),
    [adjustments],
  );

  /**
   * Whether panning can move anything, derived without measuring.
   *
   * Overhang is scale invariant: with a cover fit, the image exceeds the
   * frame in some axis exactly when their aspect ratios differ, or when zoom
   * has pushed it past cover. The pixel size of the frame never enters it, so
   * this needs no ref and no ResizeObserver.
   */
  const canPan = useMemo(() => {
    if (!source) return false;
    const sourceAspect = source.natural.width / source.natural.height;
    const frameAspect = output.width / output.height;
    return (
      transform.zoom > 1.001 || Math.abs(sourceAspect - frameAspect) > 0.001
    );
  }, [source, output.width, output.height, transform.zoom]);

  const adoptFile = useCallback(
    async (file: File) => {
      const rejection = validateImageFile(file, maxBytes);
      if (rejection) {
        setError(imageRejectionMessage(rejection, maxBytes));
        return;
      }

      const url = URL.createObjectURL(file);
      let natural: ImageOutputSize;
      try {
        const img = await loadImageElement(url);
        natural = { width: img.naturalWidth, height: img.naturalHeight };
      } catch {
        URL.revokeObjectURL(url);
        setError("That image could not be opened. Please try another file.");
        return;
      }

      setSource({
        url,
        // Validation already restricted this to the accepted list; the guard
        // is here so the type narrows rather than being asserted.
        type: isAcceptedImageType(file.type) ? file.type : "image/jpeg",
        name: file.name,
        natural,
      });
      setTransformState(IDENTITY_TRANSFORM);
      setAdjustmentsState(IDENTITY_ADJUSTMENTS);
      setError(null);
      setStage("editing");
    },
    [maxBytes],
  );

  const selectFile = useCallback(
    (file: File) => {
      void adoptFile(file);
    },
    [adoptFile],
  );

  /**
   * Pull the image already on file back in so it can be re-edited.
   *
   * Fetched into a real File rather than pointed at directly, for two
   * reasons: a remote source taints the canvas and makes `toBlob` throw, and
   * the export needs the source's MIME to decide whether alpha is even
   * possible. It reports failure loudly, because the previous version left
   * Save silently inert when this went wrong.
   */
  const editCurrentImage = useCallback(async () => {
    if (!currentImageUrl) return;
    try {
      const response = await fetch(currentImageUrl, { mode: "cors" });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const type: AcceptedImageType = isAcceptedImageType(blob.type)
        ? blob.type
        : "image/jpeg";
      await adoptFile(
        new File([blob], fileNameFromUrl(currentImageUrl), { type }),
      );
    } catch {
      setError(
        "We could not load your current image for editing. Please choose a new file.",
      );
    }
  }, [currentImageUrl, adoptFile]);

  const setTransform = useCallback(
    (patch: Partial<ImageTransform>) => {
      setTransformState((prev) => {
        const next = { ...prev, ...patch };
        const frame = frameRef.current;
        if (!frame || !source) return next;
        // Clamped on every change, not only on drag: zooming back out can
        // leave a previously legal offset hanging off the edge.
        const clamped = clampPan(
          { x: next.offsetX, y: next.offsetY },
          { width: frame.clientWidth, height: frame.clientHeight },
          source.natural,
          next.zoom,
        );
        return { ...next, offsetX: clamped.x, offsetY: clamped.y };
      });
    },
    [source],
  );

  const setAdjustments = useCallback((patch: Partial<ImageAdjustments>) => {
    setAdjustmentsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setTransformState(IDENTITY_TRANSFORM);
    setAdjustmentsState(IDENTITY_ADJUSTMENTS);
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustmentsState(IDENTITY_ADJUSTMENTS);
  }, []);

  const clear = useCallback(() => {
    setSource(null);
    setTransformState(IDENTITY_TRANSFORM);
    setAdjustmentsState(IDENTITY_ADJUSTMENTS);
    setError(null);
    setStage("empty");
  }, []);

  /**
   * Render, then hand the bytes over, and resolve only when both are done.
   *
   * The frame is measured here rather than assumed. The old export divided by
   * a hardcoded 384, so any layout that sized the crop viewport differently
   * silently mapped the pan to the wrong output pixels.
   */
  const commit = useCallback(async (): Promise<boolean> => {
    if (!source) return false;
    const frame = frameRef.current;
    if (!frame) return false;

    setError(null);
    setStage("rendering");
    let file: File;
    try {
      file = await renderEditedImage({
        sourceUrl: source.url,
        sourceType: source.type,
        frame: { width: frame.clientWidth, height: frame.clientHeight },
        output,
        transform,
        adjustments: canApplyFilters ? adjustments : IDENTITY_ADJUSTMENTS,
        sourceFileName: source.name,
      });
    } catch {
      setStage("editing");
      setError("We could not prepare that image. Please try another file.");
      return false;
    }

    // Encoding can grow a file, most obviously when a transparent source has
    // to stay PNG. Better to say so here than to let the server refuse it.
    if (file.size > maxBytes) {
      setStage("editing");
      setError(imageRejectionMessage("too-large", maxBytes));
      return false;
    }

    setStage("submitting");
    try {
      await onSubmit(file);
      return true;
    } catch (err) {
      setStage("editing");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "That upload did not go through. Please try again.",
      );
      return false;
    }
  }, [
    source,
    output,
    transform,
    adjustments,
    canApplyFilters,
    maxBytes,
    onSubmit,
  ]);

  return {
    stage,
    transform,
    adjustments,
    previewSrc: source?.url ?? null,
    naturalSize: source?.natural ?? null,
    canPan,
    frameRef,
    error,
    filterCss,
    canApplyFilters,
    selectFile,
    editCurrentImage,
    setTransform,
    setAdjustments,
    resetAll,
    resetAdjustments,
    commit,
    clear,
  };
}

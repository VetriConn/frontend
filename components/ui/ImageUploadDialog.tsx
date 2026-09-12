"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowsUpDown,
  HiOutlineCamera,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { EditDialog } from "@/components/ui/EditDialog";
import { useImageEditor } from "@/hooks/useImageEditor";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import {
  IDENTITY_ADJUSTMENTS,
  IMAGE_ACCEPT_ATTRIBUTE,
  buildFilterCss,
  type ImageFilterPreset,
  type ImageOutputSize,
} from "@/lib/image/imageEdit";

/**
 * Pick, capture, edit and hand over one image. The only image uploader here.
 *
 * There were two before this, and the gap between them was the point: a user's
 * avatar had a four-step editor with a camera, a crop rail and filters, while
 * a company logo had a bare file input and a size check that was wrong in both
 * directions. Same job, two answers, and the poorer one belonged to the
 * customer paying to post jobs. This is the better one, made general.
 *
 * The four modes are load-bearing, not decoration. Each asks one question and
 * shows only the controls that answer it: `view` is what you have, `choose` is
 * where the new one comes from, `camera` is taking it, `edit` is making it
 * right. A first pass at this file collapsed all four into a single screen
 * with every control on show at once, and it read as scattered because it was.
 *
 * It owns no network call. The avatar uploads straight to Cloudinary with a
 * signature; company assets go multipart through our own API so the server can
 * inspect the bytes. A component that picked the transport could not serve
 * both, so `onSubmit` receives a File and the caller decides where it goes.
 *
 * Modal chrome is EditDialog's. Focus trapping, focus restoration, Escape, the
 * backdrop and the scroll lock already live there and are already right.
 */

export type ImageMaskShape = "circle" | "rect";

export interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Names the thing being changed: "Profile photo", "Company logo". */
  title: string;
  /** The bold line on the choose step. The caller owns every word. */
  headline: string;
  /** The paragraph under it, saying what makes a good one. */
  description: string;
  /**
   * Exported pixel size, whose ratio is also the crop frame's, so a caller
   * states the shape once and the frame and the file cannot disagree.
   */
  output: ImageOutputSize;
  mask: ImageMaskShape;
  /** From lib/upload-limits. Required: the caps are 3, 5 and 8MB, so any
   *  default would be wrong for two of the three. */
  maxBytes: number;
  currentImageUrl?: string;
  /** Shown in the frame when there is nothing on file yet. */
  placeholder?: React.ReactNode;
  /** Offer the webcam. True only where a person is the subject. */
  allowCamera?: boolean;
  /** Must throw on failure and must not raise its own toast, or the problem
   *  gets announced twice. */
  onSubmit: (file: File) => Promise<void>;
  /** Omit where there is no removal path. Company assets have none today. */
  onRemove?: () => Promise<void>;
}

type Mode = "view" | "choose" | "camera" | "edit";
type Tab = "crop" | "filter" | "adjust";

const FILTERS: { value: ImageFilterPreset; label: string }[] = [
  { value: "none", label: "Original" },
  { value: "grayscale", label: "B&W" },
  { value: "sepia", label: "Sepia" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "high-contrast", label: "Vivid" },
];

const SLIDERS = [
  { key: "brightness", label: "Brightness" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
] as const;

const PILL =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const PILL_PRIMARY = `${PILL} bg-primary text-white hover:bg-primary-hover`;
const PILL_OUTLINE = `${PILL} border border-gray-300 text-gray-700 hover:border-gray-400`;

const RAIL_LABEL =
  "text-xs font-semibold uppercase tracking-wide text-gray-500";
const RAIL_VALUE = "text-xs font-semibold text-primary";
/** See .image-range in globals.css: thick track, large solid thumb. */
const SLIDER = "image-range";
const ICON_BUTTON =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-600 transition-colors hover:border-primary hover:text-primary";
const RESET_BUTTON =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400";

const flipButton = (on: boolean) =>
  `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
    on
      ? "border-primary text-primary"
      : "border-gray-300 text-gray-700 hover:border-gray-400"
  }`;

/** Icon above a small label, which is the shape the view footer uses. */
function StackedAction({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[44px] min-w-[44px] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        danger
          ? "text-gray-600 hover:text-red-700"
          : "text-gray-600 hover:text-primary"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  title,
  headline,
  description,
  output,
  mask,
  maxBytes,
  currentImageUrl,
  placeholder,
  allowCamera = false,
  onSubmit,
  onRemove,
}: ImageUploadDialogProps): React.ReactElement | null {
  // Destructured at the call site, which is the house pattern and also what
  // keeps the React Compiler happy: both hooks return an object carrying a
  // ref, and reading a member off one during render reads as touching a ref.
  const {
    transform,
    adjustments,
    previewSrc,
    naturalSize,
    canPan,
    frameRef,
    error: editorError,
    filterCss,
    canApplyFilters,
    stage,
    selectFile,
    editCurrentImage,
    setTransform,
    setAdjustments,
    resetAll,
    resetAdjustments,
    commit,
    clear: clearEditor,
  } = useImageEditor({ output, maxBytes, currentImageUrl, onSubmit });

  const {
    videoRef,
    isActive: cameraActive,
    error: cameraError,
    start: startCamera,
    stop: stopCamera,
    capture: capturePhoto,
  } = useCameraCapture();

  // An image on file opens on `view`; an empty slot opens straight on the
  // choice, because "here is nothing, would you like to edit it" is not a
  // question worth asking.
  const [mode, setMode] = useState<Mode>(currentImageUrl ? "view" : "choose");
  const [tab, setTab] = useState<Tab>("crop");
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  const busy = stage === "rendering" || stage === "submitting";

  const closeEverything = useCallback(() => {
    stopCamera();
    clearEditor();
    setMode(currentImageUrl ? "view" : "choose");
    setTab("crop");
    setRemoveError(null);
    onClose();
  }, [stopCamera, clearEditor, currentImageUrl, onClose]);

  const leaveCamera = useCallback(() => {
    stopCamera();
    setMode(currentImageUrl ? "view" : "choose");
  }, [stopCamera, currentImageUrl]);

  const openCamera = useCallback(async () => {
    setMode("camera");
    await startCamera();
  }, [startCamera]);

  const takePhoto = useCallback(async () => {
    const file = await capturePhoto();
    stopCamera();
    if (!file) {
      setMode("choose");
      return;
    }
    selectFile(file);
    setMode("edit");
  }, [capturePhoto, stopCamera, selectFile]);

  const editExisting = useCallback(async () => {
    await editCurrentImage();
    setMode("edit");
  }, [editCurrentImage]);

  const handleCommit = useCallback(async () => {
    if (await commit()) closeEverything();
  }, [commit, closeEverything]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;
    setRemoveError(null);
    setIsRemoving(true);
    try {
      await onRemove();
      closeEverything();
    } catch (err) {
      setRemoveError(
        err instanceof Error && err.message
          ? err.message
          : "That did not go through. Please try again.",
      );
    } finally {
      setIsRemoving(false);
    }
  }, [onRemove, closeEverything]);

  // Pointer events, so one pair of handlers covers mouse and touch. The
  // editor this replaces carried two near-identical sets, and only the mouse
  // one guarded against a second finger.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!previewSrc) return;
    dragOrigin.current = {
      x: e.clientX - transform.offsetX,
      y: e.clientY - transform.offsetY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;
    setTransform({
      offsetX: e.clientX - origin.x,
      offsetY: e.clientY - origin.y,
    });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isOpen) return null;

  /**
   * The crop boundary draws its own edge.
   *
   * The clip alone is invisible whenever the image reaches it in the panel's
   * own colour: a white logo inside a white panel leaves nothing to show
   * where the circle is, so "drag the photo inside the circle" asks you to
   * aim at a boundary you cannot see. A ring and a soft shadow make the
   * region legible whatever the picture happens to be.
   */
  const maskClass = `ring-1 ring-gray-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ${
    mask === "circle" ? "rounded-full" : "rounded-xl"
  }`;
  const ratio: React.CSSProperties = {
    aspectRatio: `${output.width} / ${output.height}`,
  };
  const shapeNoun = mask === "circle" ? "circle" : "frame";
  /** True when the source is relatively taller than the frame, so covering it
   *  pins the width and lets the height overhang. */
  const coverAlongWidth = naturalSize
    ? naturalSize.width / naturalSize.height <= output.width / output.height
    : true;

  const heading =
    mode === "choose"
      ? "Update"
      : mode === "camera"
        ? "Use camera"
        : mode === "edit"
          ? "Edit image"
          : title;

  const currentPreview = currentImageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={currentImageUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      {placeholder}
    </div>
  );

  /** Each mode answers a different question, so each gets its own footer. */
  const footer =
    mode === "view" ? (
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1">
          {currentImageUrl && (
            <StackedAction
              icon={<HiOutlinePencilSquare className="h-5 w-5" />}
              label="Edit"
              onClick={() => void editExisting()}
            />
          )}
          <StackedAction
            icon={<HiOutlineCamera className="h-5 w-5" />}
            label="Update"
            onClick={() => setMode("choose")}
          />
        </div>
        {onRemove && currentImageUrl && (
          <StackedAction
            icon={<HiOutlineTrash className="h-5 w-5" />}
            label={isRemoving ? "Removing" : "Delete"}
            onClick={() => void handleRemove()}
            disabled={isRemoving}
            danger
          />
        )}
      </div>
    ) : mode === "choose" ? (
      <>
        <button type="button" onClick={closeEverything} className={PILL_OUTLINE}>
          Cancel
        </button>
        {allowCamera && (
          <button
            type="button"
            onClick={() => void openCamera()}
            className={`${PILL} border border-primary text-primary hover:bg-red-50`}
          >
            Use camera
          </button>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={PILL_PRIMARY}
        >
          Upload photo
        </button>
      </>
    ) : mode === "camera" ? (
      <button type="button" onClick={leaveCamera} className={PILL_OUTLINE}>
        Back
      </button>
    ) : (
      <>
        <button
          type="button"
          onClick={closeEverything}
          disabled={busy}
          className={PILL_OUTLINE}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleCommit()}
          disabled={busy || !previewSrc}
          className={PILL_PRIMARY}
        >
          {busy ? "Saving" : "Save photo"}
        </button>
      </>
    );

  return (
    <EditDialog
      isOpen={isOpen}
      title={heading}
      size="lg"
      onClose={closeEverything}
      onSubmit={() => void handleCommit()}
      isSubmitting={busy || isRemoving}
      footer={footer}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so re-picking the same file fires change again.
          e.target.value = "";
          if (!file) return;
          selectFile(file);
          setMode("edit");
        }}
      />

      {mode === "view" && (
        <div className="flex justify-center py-2">
          <div
            style={ratio}
            className={`w-full max-w-[23rem] overflow-hidden bg-gray-100 ${maskClass}`}
          >
            {currentPreview}
          </div>
        </div>
      )}

      {mode === "choose" && (
        <div className="mx-auto max-w-md text-center">
          <h3 className="text-lg font-bold text-gray-900">{headline}</h3>
          <div className="my-6 flex justify-center">
            <div
              style={ratio}
              className={`w-40 overflow-hidden bg-gray-100 ${maskClass}`}
            >
              {currentPreview}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      )}

      {mode === "camera" && (
        <div className="flex justify-center py-2">
          <div
            style={ratio}
            className={`relative w-full max-w-[23rem] overflow-hidden bg-gray-900 ${maskClass}`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover scale-x-[-1]"
            />
            <button
              type="button"
              onClick={() => void takePhoto()}
              disabled={!cameraActive}
              className={`${PILL_PRIMARY} absolute bottom-6 left-1/2 -translate-x-1/2 shadow-lg`}
            >
              Capture photo
            </button>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px] md:gap-6">
          {/* Preview. Measured at commit time, so the pan maps to output
              pixels at whatever size this actually rendered. */}
          <div className="md:border-r md:border-gray-200 md:pr-6">
            <div
              ref={frameRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={ratio}
              className={`relative mx-auto w-full max-w-[23rem] touch-none select-none overflow-hidden bg-gray-100 ${
                canPan ? "cursor-grab" : "cursor-default"
              } ${maskClass}`}
            >
              {previewSrc && (
                /* Cover-fitted by SIZE, not by object-fit.
                   `object-cover` crops inside the element, so the image has
                   no overflow to pan into: translating it just slid the whole
                   box off and revealed background. Sizing the long axis to
                   auto makes the overhang real, and the frame's overflow does
                   the cropping, so a drag brings actual picture into view.
                   The aspect comparison needs no measurement: the frame's
                   ratio is `output`. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt=""
                  draggable={false}
                  style={{
                    width: coverAlongWidth ? "100%" : "auto",
                    height: coverAlongWidth ? "auto" : "100%",
                    maxWidth: "none",
                    transform: `translate(-50%, -50%) translate(${transform.offsetX}px, ${transform.offsetY}px) rotate(${transform.rotation}deg) scale(${transform.zoom * (transform.flipHorizontal ? -1 : 1)}, ${transform.zoom * (transform.flipVertical ? -1 : 1)})`,
                    filter: canApplyFilters ? filterCss : undefined,
                  }}
                  className="absolute left-1/2 top-1/2"
                />
              )}
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              {canPan
                ? `Drag the photo inside the ${shapeNoun} to reposition it.`
                : "This photo already fits exactly. Zoom in if you want to reposition it."}
            </p>
          </div>

          <div>
            <div
              role="tablist"
              aria-label="Image controls"
              className="flex border-b border-gray-200"
            >
              {(
                [
                  ["crop", "Crop"],
                  ["filter", "Filter"],
                  ["adjust", "Adjust"],
                ] as const
              ).map(([value, label]) =>
                // Filter and Adjust are hidden where the canvas ignores
                // ctx.filter, rather than previewing an effect the saved file
                // would not carry.
                value !== "crop" && !canApplyFilters ? null : (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => setTab(value)}
                    className={`min-h-[44px] flex-1 border-b-2 px-3 text-base font-semibold transition-colors ${
                      tab === value
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            {tab === "crop" && (
              <div className="space-y-5 pt-5">
                <div>
                  <label
                    htmlFor="image-zoom"
                    className={`${RAIL_LABEL} mb-2 block`}
                  >
                    Zoom
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Zoom out"
                      onClick={() =>
                        setTransform({ zoom: Math.max(1, transform.zoom - 0.1) })
                      }
                      className={ICON_BUTTON}
                    >
                      <HiOutlineMagnifyingGlassMinus className="h-4 w-4" />
                    </button>
                    <input
                      id="image-zoom"
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={transform.zoom}
                      onChange={(e) =>
                        setTransform({ zoom: Number(e.target.value) })
                      }
                      className={SLIDER}
                    />
                    <button
                      type="button"
                      aria-label="Zoom in"
                      onClick={() =>
                        setTransform({ zoom: Math.min(3, transform.zoom + 0.1) })
                      }
                      className={ICON_BUTTON}
                    >
                      <HiOutlineMagnifyingGlassPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <label htmlFor="image-rotation" className={RAIL_LABEL}>
                      Rotate
                    </label>
                    <span className={RAIL_VALUE}>{transform.rotation}&deg;</span>
                  </div>
                  <input
                    id="image-rotation"
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={transform.rotation}
                    onChange={(e) =>
                      setTransform({ rotation: Number(e.target.value) })
                    }
                    className={SLIDER}
                  />
                </div>

                <div>
                  <p className={`${RAIL_LABEL} mb-2`}>Flip image</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={transform.flipHorizontal}
                      onClick={() =>
                        setTransform({
                          flipHorizontal: !transform.flipHorizontal,
                        })
                      }
                      className={flipButton(transform.flipHorizontal)}
                    >
                      <HiOutlineArrowsRightLeft className="h-4 w-4" />
                      Horizontal
                    </button>
                    <button
                      type="button"
                      aria-pressed={transform.flipVertical}
                      onClick={() =>
                        setTransform({ flipVertical: !transform.flipVertical })
                      }
                      className={flipButton(transform.flipVertical)}
                    >
                      <HiOutlineArrowsUpDown className="h-4 w-4" />
                      Vertical
                    </button>
                  </div>
                </div>

                <button type="button" onClick={resetAll} className={RESET_BUTTON}>
                  <HiOutlineArrowPath className="h-4 w-4" aria-hidden="true" />
                  Reset adjustments
                </button>
              </div>
            )}

            {tab === "filter" && (
              <div className="grid grid-cols-3 gap-3 pt-5">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={adjustments.preset === f.value}
                    onClick={() => setAdjustments({ preset: f.value })}
                    className={`rounded-xl border p-2 text-center transition-colors ${
                      adjustments.preset === f.value
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* A real thumbnail of THIS image under THIS preset. A row
                        of names alone makes you apply one to find out. */}
                    <span className="block aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      {previewSrc && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewSrc}
                          alt=""
                          className="h-full w-full object-cover"
                          style={{
                            filter: buildFilterCss({
                              ...IDENTITY_ADJUSTMENTS,
                              preset: f.value,
                            }),
                          }}
                        />
                      )}
                    </span>
                    <span className="mt-1.5 block text-xs font-medium text-gray-700">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === "adjust" && (
              <div className="space-y-5 pt-5">
                {SLIDERS.map((s) => (
                  <div key={s.key}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <label htmlFor={`image-${s.key}`} className={RAIL_LABEL}>
                        {s.label}
                      </label>
                      <span className={RAIL_VALUE}>{adjustments[s.key]}%</span>
                    </div>
                    <input
                      id={`image-${s.key}`}
                      type="range"
                      min={50}
                      max={150}
                      step={1}
                      value={adjustments[s.key]}
                      onChange={(e) =>
                        setAdjustments({ [s.key]: Number(e.target.value) })
                      }
                      className={SLIDER}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className={RESET_BUTTON}
                >
                  Reset sliders
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {(editorError || removeError || cameraError) && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {editorError ?? removeError ?? cameraError}
        </p>
      )}
    </EditDialog>
  );
}

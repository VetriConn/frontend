"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JPEG_QUALITY } from "@/lib/image/imageEdit";

/**
 * One webcam stream, and the discipline that switches it off.
 *
 * The teardown is the part ProfilePhotoModal got right, and the part that is
 * easiest to lose in a move: capture, Back, the close button and unmount each
 * ran the same stop. Tracks that nobody stops stay live, and the person does
 * not read that as a leaked MediaStream — they read it as the camera light
 * still on after the dialog has gone. So stop() is idempotent, every exit
 * calls it, and unmount calls it whether or not the caller remembered to.
 *
 * The two things the old capture got wrong, the mirror and the resolution,
 * are fixed in capture().
 */

/**
 * facingMode is fixed rather than a parameter: the one caller that offers the
 * camera is the profile photo, where the subject is the person holding the
 * device.
 *
 * The size is a preference, not a demand, and it is 1280 rather than the flat
 * 640 the old modal asked for. Ask a browser for nothing and it hands back
 * 640x480; the avatar is exported at 1200 square, so the stream, not the
 * editor, was the thing capping how sharp a captured photo could ever be.
 */
const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 1280 },
  },
};

/**
 * The name from a rejected getUserMedia, without trusting its shape.
 *
 * DOMException covers the common cases, but OverconstrainedError is its own
 * interface in some engines and a browser with no mediaDevices at all throws
 * a plain TypeError, so this reads `name` off whatever arrived rather than
 * narrowing to one class and losing the rest to the fallback message.
 */
function rejectionName(cause: unknown): string {
  if (typeof cause === "object" && cause !== null && "name" in cause) {
    const { name } = cause;
    return typeof name === "string" ? name : "";
  }
  return "";
}

/**
 * getUserMedia fails for reasons that call for different actions, and the old
 * modal answered all of them with "Couldn't access camera. Please check
 * permissions." That sends someone whose laptop has no camera, or whose
 * camera is held by a video call in another window, into browser settings to
 * hunt for a permission they already granted.
 */
function startFailureMessage(cause: unknown): string {
  switch (rejectionName(cause)) {
    case "NotAllowedError":
    case "SecurityError":
      return "Your browser is blocking the camera. Allow camera access for this site, then try again.";
    case "NotFoundError":
      return "No camera was found on this device. You can choose a photo from your files instead.";
    case "NotReadableError":
      return "Another app is using your camera. Close it, then try again.";
    default:
      return "The camera could not be started. You can choose a photo from your files instead.";
  }
}

/**
 * Whether the frame has to be flipped to match what the person was looking at.
 *
 * The preview is mirrored, because a preview that is not mirrored feels like
 * watching a stranger. The saved frame therefore has to be mirrored too: the
 * old capture drew the raw frame under a `scale-x-[-1]` video, so a person who
 * carefully centred themselves against the left edge of the circle got back a
 * photo of themselves against the right.
 *
 * No facingMode counts as front facing. Desktop Chrome reports the setting for
 * phone cameras and omits it entirely for a built-in or USB webcam, which is
 * the case this dialog mostly serves; treating "absent" as "not user" would
 * leave every laptop capture reversed, which is the defect being fixed here.
 * Only an explicit "environment", a phone's rear camera, is left alone.
 */
function shouldMirror(stream: MediaStream | null): boolean {
  const track = stream?.getVideoTracks()[0];
  if (!track) return false;
  const { facingMode } = track.getSettings();
  return facingMode === undefined || facingMode === "user";
}

export interface UseCameraCaptureResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  start: () => Promise<void>;
  /** Idempotent. Called on capture, on back, on close and on unmount. */
  stop: () => void;
  /**
   * Square centre crop of the current frame at the sensor's native
   * resolution, mirrored to match the preview when the track reports
   * facingMode "user". The current capture draws the raw frame while the
   * video is scale-x-[-1], so what the user frames is the mirror of what
   * gets saved.
   */
  capture: () => Promise<File | null>;
}

export function useCameraCapture(): UseCameraCaptureResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Unconditional, so calling stop() twice is the same as calling it once.
    // Every exit path calls this, and several of them overlap: Back after a
    // capture, or a close while the capture is still encoding.
    setIsActive(false);
  }, []);

  /**
   * Never rejects. A failure is the `error` string, because the dialog shows
   * it inline next to the button that caused it, and a promise rejected out of
   * a click handler is an unhandled rejection nobody ever sees.
   */
  const start = useCallback(async () => {
    setError(null);
    // A second start() with the first stream still live leaves two sets of
    // tracks open and only one of them reachable to stop.
    stop();

    if (!navigator.mediaDevices?.getUserMedia) {
      // Absent on plain http and inside some in-app browsers, so this is not
      // a failure the person can fix by granting anything.
      setError(
        "This browser cannot open the camera on this page. You can choose a photo from your files instead.",
      );
      return;
    }

    try {
      streamRef.current =
        await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      setIsActive(true);
    } catch (cause) {
      setError(startFailureMessage(cause));
    }
  }, [stop]);

  // Attached here rather than at the end of start(). A caller that mounts the
  // <video> only once isActive is true has no element for start() to assign
  // to, and the result is a black panel over a camera that is running.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = isActive ? streamRef.current : null;
  }, [isActive]);

  // The exit no handler can cover: a route change, or a parent unmounting
  // mid-session, with the camera still open.
  useEffect(() => stop, [stop]);

  const capture = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    // videoWidth is 0 until the first frame arrives. Pressing Capture in that
    // gap used to return silently, which reads as a dead button.
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError(
        "The camera is still starting. Give it a moment, then try again.",
      );
      return null;
    }

    // The sensor's own square, not a hardcoded 640. The old capture threw away
    // detail from a 1280 stream and then the editor scaled what was left up to
    // 1200, which is how a capture came out softer than the same face uploaded
    // from a file.
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - side) / 2;
    const sourceY = (video.videoHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("The photo could not be taken. Try again.");
      return null;
    }

    if (shouldMirror(streamRef.current)) {
      // Translate then scale, so the flipped frame lands back inside the
      // canvas instead of off its left edge.
      ctx.translate(side, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sourceX, sourceY, side, side, 0, 0, side, side);

    // The pixels are in the canvas now, so there is no reason to hold the
    // camera open across the encode. The light goes out as the shutter fires.
    stop();

    const blob = await new Promise<Blob | null>((resolve) => {
      // The same quality the editor encodes its export at, imported rather
      // than retyped so the two cannot drift. This frame is only the editor's
      // source, so a lower number here would throw detail away before the crop
      // has even been chosen.
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) {
      setError("The photo could not be taken. Try again.");
      return null;
    }

    setError(null);
    // The editor rewrites the extension to match whatever it encodes, so this
    // name only has to be honest about what is in it now.
    return new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
  }, [stop]);

  return { videoRef, isActive, error, start, stop, capture };
}

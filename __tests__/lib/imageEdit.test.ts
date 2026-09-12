/**
 * Tests for the image editor's pure layer.
 *
 * Every one of these rules used to live inside `imgEl.onload` in
 * ProfilePhotoModal, where jsdom's missing 2D context put all of it out of
 * reach of a test, and where four of them were wrong: a cover fit written
 * only for a square canvas, pan offsets scaled against a frame assumed to be
 * 384px, a filter chain typed out twice, and a pan with no bound at all so
 * the image could be dragged out of frame and exported blank.
 *
 * renderEditedImage is deliberately absent. It needs a real 2D context, and
 * everything it decides that is not a straight ctx call is asserted here.
 */

import * as fc from "fast-check";
import {
  ACCEPTED_IMAGE_TYPES,
  IDENTITY_ADJUSTMENTS,
  IDENTITY_TRANSFORM,
  buildFilterCss,
  clampPan,
  computeDrawGeometry,
  imageRejectionMessage,
  validateImageFile,
  type ImageFilterPreset,
  type ImageOutputSize,
  type ImageRejection,
} from "@/lib/image/imageEdit";
import {
  MAX_COMPANY_BANNER_BYTES,
  MAX_COMPANY_LOGO_BYTES,
  MAX_PROFILE_PHOTO_BYTES,
} from "@/lib/upload-limits";

/**
 * A File that reports the size we want without allocating it. Only `size` and
 * `type` are read, and building a genuine 8MB fixture per case would cost
 * more than the whole suite.
 */
const imageFile = (size: number, type: string, name = "photo.jpg"): File => {
  const file = new File(["stand-in"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const SQUARE_OUTPUT: ImageOutputSize = { width: 1200, height: 1200 };
/** The banner, whose 16:3 output is what broke the old square-only math. */
const BANNER_OUTPUT: ImageOutputSize = { width: 1600, height: 300 };

describe("validateImageFile", () => {
  it("should pass a file of exactly the ceiling", () => {
    // The server refuses above the limit, not at it. A client checking >=
    // would turn a legal upload into a refusal the user cannot act on.
    expect(
      validateImageFile(
        imageFile(MAX_COMPANY_LOGO_BYTES, "image/jpeg"),
        MAX_COMPANY_LOGO_BYTES,
      ),
    ).toBeNull();
  });

  it("should reject a file one byte over the ceiling", () => {
    expect(
      validateImageFile(
        imageFile(MAX_COMPANY_LOGO_BYTES + 1, "image/jpeg"),
        MAX_COMPANY_LOGO_BYTES,
      ),
    ).toBe("too-large");
  });

  it("should pass each of the three types the server allows", () => {
    for (const type of ACCEPTED_IMAGE_TYPES) {
      expect(
        validateImageFile(imageFile(1024, type), MAX_PROFILE_PHOTO_BYTES),
      ).toBeNull();
    }
  });

  it.each([
    ["image/gif"],
    ["image/bmp"],
    ["image/svg+xml"],
    ["image/tiff"],
    ["image/heic"],
    ["image/avif"],
    ["application/pdf"],
    // Some pickers report nothing at all for a file they cannot classify.
    [""],
  ])("should reject %s, which no server allow-list here permits", (type) => {
    // CompanyProfileEditor's accept="image/*" is wider than its own multer
    // fileFilter, which is how a picked GIF reaches the server and comes
    // back as an upload failure with nothing the user can do about it.
    expect(
      validateImageFile(imageFile(1024, type), MAX_PROFILE_PHOTO_BYTES),
    ).toBe("unsupported-type");
  });

  it("should reject an empty file even when the ceiling is generous", () => {
    // A zero-byte pick is a real thing on Android when the photo is still
    // syncing from the cloud. Sent as is, the server answers "Blocked
    // upload: empty file", which reads as our fault rather than a retry.
    expect(
      validateImageFile(imageFile(0, "image/png"), MAX_COMPANY_BANNER_BYTES),
    ).toBe("empty");
  });

  it("should name the type, not the size, when a file fails both", () => {
    // Shrinking a GIF does not make it uploadable, so the message that gets
    // the user somewhere is the one about the format.
    expect(
      validateImageFile(
        imageFile(MAX_COMPANY_LOGO_BYTES * 4, "image/gif"),
        MAX_COMPANY_LOGO_BYTES,
      ),
    ).toBe("unsupported-type");
  });

  it("should pass any accepted file at or under the ceiling", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_COMPANY_LOGO_BYTES }),
        fc.constantFrom(...ACCEPTED_IMAGE_TYPES),
        (size, type) => {
          expect(
            validateImageFile(imageFile(size, type), MAX_COMPANY_LOGO_BYTES),
          ).toBeNull();
        },
      ),
      { numRuns: 200 },
    );
  });

  it("should reject any accepted file over the ceiling", () => {
    fc.assert(
      fc.property(
        fc.integer({
          min: MAX_COMPANY_LOGO_BYTES + 1,
          max: MAX_COMPANY_LOGO_BYTES * 8,
        }),
        fc.constantFrom(...ACCEPTED_IMAGE_TYPES),
        (size, type) => {
          expect(
            validateImageFile(imageFile(size, type), MAX_COMPANY_LOGO_BYTES),
          ).toBe("too-large");
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("imageRejectionMessage", () => {
  const EVERY_REJECTION: ImageRejection[] = [
    "too-large",
    "unsupported-type",
    "empty",
  ];

  it("should name the ceiling this caller actually enforces", () => {
    // The three real caps are 3MB, 5MB and 8MB, so a message that named one
    // shared number would be lying to two of the three call sites.
    expect(imageRejectionMessage("too-large", MAX_COMPANY_LOGO_BYTES)).toContain(
      "3 MB",
    );
    expect(
      imageRejectionMessage("too-large", MAX_PROFILE_PHOTO_BYTES),
    ).toContain("5 MB");
    expect(
      imageRejectionMessage("too-large", MAX_COMPANY_BANNER_BYTES),
    ).toContain("8 MB");
  });

  it("should name the formats that would work instead", () => {
    const message = imageRejectionMessage(
      "unsupported-type",
      MAX_PROFILE_PHOTO_BYTES,
    );
    expect(message).toContain("JPG");
    expect(message).toContain("PNG");
    expect(message).toContain("WebP");
  });

  it("should have real wording for every rejection", () => {
    for (const rejection of EVERY_REJECTION) {
      const message = imageRejectionMessage(rejection, MAX_PROFILE_PHOTO_BYTES);
      expect(message.length).toBeGreaterThan(20);
      expect(message.endsWith(".")).toBe(true);
    }
  });

  it("should never put a dash where a full stop belongs", () => {
    // House rule: no em or en dashes in anything the user reads. This is the
    // only place the rejection wording is written, so this is the only place
    // it can slip in.
    for (const rejection of EVERY_REJECTION) {
      expect(
        imageRejectionMessage(rejection, MAX_COMPANY_BANNER_BYTES),
      ).not.toMatch(/[—–]/);
    }
  });
});

describe("buildFilterCss", () => {
  const SLIDERS_AT_REST = "brightness(100%) contrast(100%) saturate(100%)";

  it("should leave the image alone at the identity adjustments", () => {
    expect(buildFilterCss(IDENTITY_ADJUSTMENTS)).toBe(SLIDERS_AT_REST);
  });

  it.each<[ImageFilterPreset, string]>([
    ["none", SLIDERS_AT_REST],
    ["grayscale", `${SLIDERS_AT_REST} grayscale(100%)`],
    ["sepia", `${SLIDERS_AT_REST} sepia(80%)`],
    ["warm", `${SLIDERS_AT_REST} sepia(30%) saturate(120%) hue-rotate(-10deg)`],
    ["cool", `${SLIDERS_AT_REST} saturate(90%) hue-rotate(10deg)`],
    ["high-contrast", `${SLIDERS_AT_REST} contrast(140%) brightness(105%)`],
  ])("should build the %s chain", (preset, expected) => {
    // These are the exact strings the old preview and the old export each
    // spelled out by hand. Locking them here is what lets the two call sites
    // become one without anything changing on screen.
    expect(buildFilterCss({ ...IDENTITY_ADJUSTMENTS, preset })).toBe(expected);
  });

  it("should compose the sliders with the preset rather than replace them", () => {
    // warm carries its own saturate. The user's saturation slider has to
    // survive it, which it only does because the preset comes second.
    expect(
      buildFilterCss({
        preset: "warm",
        brightness: 120,
        contrast: 80,
        saturation: 140,
      }),
    ).toBe(
      "brightness(120%) contrast(80%) saturate(140%) sepia(30%) saturate(120%) hue-rotate(-10deg)",
    );
  });

  it("should start every preset with the sliders", () => {
    const presets: ImageFilterPreset[] = [
      "none",
      "grayscale",
      "sepia",
      "warm",
      "cool",
      "high-contrast",
    ];
    for (const preset of presets) {
      expect(
        buildFilterCss({
          preset,
          brightness: 55,
          contrast: 145,
          saturation: 70,
        }),
      ).toMatch(/^brightness\(55%\) contrast\(145%\) saturate\(70%\)/);
    }
  });
});

describe("clampPan", () => {
  /** 384px frame, 2:1 source: 768x384 on screen, so 192px of slack each way. */
  const FRAME: ImageOutputSize = { width: 384, height: 384 };
  const LANDSCAPE: ImageOutputSize = { width: 2000, height: 1000 };
  const PORTRAIT: ImageOutputSize = { width: 1000, height: 2000 };

  it("should leave a pan inside the overhang untouched", () => {
    expect(clampPan({ x: 100, y: 0 }, FRAME, LANDSCAPE, 1)).toEqual({
      x: 100,
      y: 0,
    });
  });

  it("should stop a wide image at the edge of its overhang", () => {
    // Without this the pointer delta goes straight into the transform, so
    // one flick of the wrist exports a fully transparent square.
    expect(clampPan({ x: 5000, y: 0 }, FRAME, LANDSCAPE, 1).x).toBeCloseTo(192);
    expect(clampPan({ x: -5000, y: 0 }, FRAME, LANDSCAPE, 1).x).toBeCloseTo(
      -192,
    );
  });

  it("should refuse any pan on the axis where the image exactly fits", () => {
    // A 2:1 source cover-fitted into a square frame has no vertical slack at
    // all, so vertical dragging must do nothing rather than open a gap.
    expect(clampPan({ x: 0, y: 300 }, FRAME, LANDSCAPE, 1).y).toBeCloseTo(0);
    expect(clampPan({ x: 0, y: -300 }, FRAME, LANDSCAPE, 1).y).toBeCloseTo(0);
  });

  it("should give a tall image its slack vertically instead", () => {
    expect(clampPan({ x: 300, y: 5000 }, FRAME, PORTRAIT, 1).x).toBeCloseTo(0);
    expect(clampPan({ x: 300, y: 5000 }, FRAME, PORTRAIT, 1).y).toBeCloseTo(
      192,
    );
  });

  it("should widen the overhang as the user zooms in", () => {
    // At zoom 2 the 768x384 image becomes 1536x768, so 576 across and 192
    // down. Zoom is the only thing that buys vertical room here.
    const clamped = clampPan({ x: 5000, y: 5000 }, FRAME, LANDSCAPE, 2);
    expect(clamped.x).toBeCloseTo(576);
    expect(clamped.y).toBeCloseTo(192);
  });

  it("should let a square source pan in neither direction at zoom 1", () => {
    const square: ImageOutputSize = { width: 900, height: 900 };
    const clamped = clampPan({ x: 400, y: -400 }, FRAME, square, 1);
    expect(clamped.x).toBeCloseTo(0);
    expect(clamped.y).toBeCloseTo(0);
  });

  it("should keep the frame covered for any pan a pointer could produce", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -20_000, max: 20_000, noNaN: true }),
        fc.double({ min: -20_000, max: 20_000, noNaN: true }),
        fc.double({ min: 1, max: 3, noNaN: true }),
        fc.integer({ min: 40, max: 6000 }),
        fc.integer({ min: 40, max: 6000 }),
        (x, y, zoom, naturalWidth, naturalHeight) => {
          const natural = { width: naturalWidth, height: naturalHeight };
          const clamped = clampPan({ x, y }, FRAME, natural, zoom);

          // The invariant, stated as the defect: after clamping, no edge of
          // the frame can see past an edge of the image.
          const cover = Math.max(
            FRAME.width / natural.width,
            FRAME.height / natural.height,
          );
          const shownWidth = natural.width * cover * zoom;
          const shownHeight = natural.height * cover * zoom;
          const slack = 1e-6;

          expect(clamped.x - shownWidth / 2).toBeLessThanOrEqual(
            -FRAME.width / 2 + slack,
          );
          expect(clamped.x + shownWidth / 2).toBeGreaterThanOrEqual(
            FRAME.width / 2 - slack,
          );
          expect(clamped.y - shownHeight / 2).toBeLessThanOrEqual(
            -FRAME.height / 2 + slack,
          );
          expect(clamped.y + shownHeight / 2).toBeGreaterThanOrEqual(
            FRAME.height / 2 - slack,
          );
        },
      ),
      { numRuns: 300 },
    );
  });
});

describe("computeDrawGeometry", () => {
  const FRAME: ImageOutputSize = { width: 384, height: 384 };

  it("should cover a square output from a landscape source", () => {
    // The old code reached this same answer as `canvas.height * zoom` scaled
    // by the aspect ratio. It is kept identical on purpose: the square case
    // is the one that shipped, and nothing about it should move.
    const geometry = computeDrawGeometry({
      transform: IDENTITY_TRANSFORM,
      source: { width: 2000, height: 1000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });

    expect(geometry.drawWidth).toBeCloseTo(2400);
    expect(geometry.drawHeight).toBeCloseTo(1200);
    expect(geometry.drawX).toBeCloseTo(-1200);
    expect(geometry.drawY).toBeCloseTo(-600);
    expect(geometry.translateX).toBeCloseTo(600);
    expect(geometry.translateY).toBeCloseTo(600);
  });

  it("should cover a square output from a portrait source", () => {
    const geometry = computeDrawGeometry({
      transform: IDENTITY_TRANSFORM,
      source: { width: 1000, height: 2000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });

    expect(geometry.drawWidth).toBeCloseTo(1200);
    expect(geometry.drawHeight).toBeCloseTo(2400);
  });

  it("should fill a square output exactly from a square source", () => {
    const geometry = computeDrawGeometry({
      transform: IDENTITY_TRANSFORM,
      source: { width: 900, height: 900 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });

    expect(geometry.drawWidth).toBeCloseTo(1200);
    expect(geometry.drawHeight).toBeCloseTo(1200);
    expect(geometry.drawX).toBeCloseTo(-600);
    expect(geometry.drawY).toBeCloseTo(-600);
  });

  it("should cover a 16:3 banner instead of leaving bars down both sides", () => {
    // This is the case the old math could not do. Scaling canvas.height by
    // the source aspect gave 600x300 into a 1600 wide canvas, so a banner
    // would have exported with 500px of transparency at each end.
    const geometry = computeDrawGeometry({
      transform: IDENTITY_TRANSFORM,
      source: { width: 2000, height: 1000 },
      frame: { width: 640, height: 120 },
      output: BANNER_OUTPUT,
    });

    expect(geometry.drawWidth).toBeCloseTo(1600);
    expect(geometry.drawHeight).toBeCloseTo(800);
    expect(geometry.drawWidth).not.toBeCloseTo(600);
  });

  it("should cover a 16:3 banner from a tall source too", () => {
    const geometry = computeDrawGeometry({
      transform: IDENTITY_TRANSFORM,
      source: { width: 1000, height: 2000 },
      frame: { width: 640, height: 120 },
      output: BANNER_OUTPUT,
    });

    expect(geometry.drawWidth).toBeCloseTo(1600);
    expect(geometry.drawHeight).toBeCloseTo(3200);
  });

  it("should scale pan by the measured frame, not by an assumed 384", () => {
    // With the old `clientWidth || 384` an unmeasured 320px frame moved the
    // export by 631.25 instead of 637.5, which is the export quietly
    // disagreeing with the crop the user set up.
    const geometry = computeDrawGeometry({
      transform: { ...IDENTITY_TRANSFORM, offsetX: 10, offsetY: -20 },
      source: { width: 2000, height: 1000 },
      frame: { width: 320, height: 320 },
      output: SQUARE_OUTPUT,
    });

    expect(geometry.translateX).toBeCloseTo(637.5);
    expect(geometry.translateY).toBeCloseTo(525);
  });

  it("should scale pan per axis where the frame and output ratios differ", () => {
    // A 640x150 banner frame is 2.5x horizontally and 2x vertically. One
    // shared ratio would skew every vertical nudge on a banner.
    const geometry = computeDrawGeometry({
      transform: { ...IDENTITY_TRANSFORM, offsetX: 10, offsetY: 10 },
      source: { width: 2000, height: 1000 },
      frame: { width: 640, height: 150 },
      output: BANNER_OUTPUT,
    });

    expect(geometry.translateX).toBeCloseTo(825);
    expect(geometry.translateY).toBeCloseTo(170);
  });

  it("should convert the rotation slider's degrees to radians", () => {
    const quarterTurn = computeDrawGeometry({
      transform: { ...IDENTITY_TRANSFORM, rotation: 90 },
      source: { width: 1000, height: 1000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });
    const fullEnd = computeDrawGeometry({
      transform: { ...IDENTITY_TRANSFORM, rotation: -180 },
      source: { width: 1000, height: 1000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });

    expect(quarterTurn.rotateRadians).toBeCloseTo(Math.PI / 2);
    expect(fullEnd.rotateRadians).toBeCloseTo(-Math.PI);
  });

  it("should return -1 for a flip without disturbing the pan", () => {
    // A mirror about the image's own centre. If the flip leaked into the
    // translate the image would jump sideways as the button was pressed.
    const base = {
      source: { width: 2000, height: 1000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    };
    const upright = computeDrawGeometry({
      ...base,
      transform: { ...IDENTITY_TRANSFORM, offsetX: 25, offsetY: -15 },
    });
    const flipped = computeDrawGeometry({
      ...base,
      transform: {
        ...IDENTITY_TRANSFORM,
        offsetX: 25,
        offsetY: -15,
        flipHorizontal: true,
        flipVertical: true,
      },
    });

    expect(upright.scaleX).toBe(1);
    expect(upright.scaleY).toBe(1);
    expect(flipped.scaleX).toBe(-1);
    expect(flipped.scaleY).toBe(-1);
    expect(flipped.translateX).toBeCloseTo(upright.translateX);
    expect(flipped.translateY).toBeCloseTo(upright.translateY);
    expect(flipped.drawX).toBeCloseTo(upright.drawX);
    expect(flipped.drawY).toBeCloseTo(upright.drawY);
  });

  it("should grow the drawn image around its own centre as zoom rises", () => {
    const zoomed = computeDrawGeometry({
      transform: { ...IDENTITY_TRANSFORM, zoom: 2 },
      source: { width: 2000, height: 1000 },
      frame: FRAME,
      output: SQUARE_OUTPUT,
    });

    expect(zoomed.drawWidth).toBeCloseTo(4800);
    expect(zoomed.drawHeight).toBeCloseTo(2400);
    expect(zoomed.drawX).toBeCloseTo(-zoomed.drawWidth / 2);
    expect(zoomed.drawY).toBeCloseTo(-zoomed.drawHeight / 2);
    // Zoom must not move the image, only enlarge it.
    expect(zoomed.translateX).toBeCloseTo(600);
    expect(zoomed.translateY).toBeCloseTo(600);
  });

  it("should never leave a gap, for any source against any output", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 6000 }),
        fc.integer({ min: 1, max: 6000 }),
        fc.integer({ min: 16, max: 4000 }),
        fc.integer({ min: 16, max: 4000 }),
        fc.double({ min: 1, max: 3, noNaN: true }),
        (sourceWidth, sourceHeight, outputWidth, outputHeight, zoom) => {
          const geometry = computeDrawGeometry({
            transform: { ...IDENTITY_TRANSFORM, zoom },
            source: { width: sourceWidth, height: sourceHeight },
            frame: FRAME,
            output: { width: outputWidth, height: outputHeight },
          });
          const slack = 1e-6;

          expect(geometry.drawWidth).toBeGreaterThanOrEqual(
            outputWidth - slack,
          );
          expect(geometry.drawHeight).toBeGreaterThanOrEqual(
            outputHeight - slack,
          );
          // Cover, not stretch: the source's own proportions survive.
          expect(geometry.drawWidth / geometry.drawHeight).toBeCloseTo(
            sourceWidth / sourceHeight,
            5,
          );
        },
      ),
      { numRuns: 300 },
    );
  });
});

/**
 * Unit Tests for the Next.js image loader.
 *
 * The loader injects Cloudinary transformations after `/upload/`. It must
 * handle the versioned and foldered URL shapes Cloudinary actually returns
 * from uploads, own the w/q/f params that Next.js drives via srcset, leave
 * other author transformations alone, and be idempotent.
 */

import cloudinaryLoader from "@/lib/cloudinary-loader";

const CLOUD = "https://res.cloudinary.com/demo/image/upload";

describe("cloudinaryLoader", () => {
  describe("non-Cloudinary sources", () => {
    it("should pass through a root-relative local path untouched", () => {
      expect(
        cloudinaryLoader({ src: "/images/logo.svg", width: 640, quality: 75 }),
      ).toBe("/images/logo.svg");
    });

    it("should pass through a root-relative path even if it mentions upload", () => {
      expect(
        cloudinaryLoader({ src: "/upload/logo.svg", width: 640, quality: 75 }),
      ).toBe("/upload/logo.svg");
    });

    it("should pass through a third-party absolute URL untouched", () => {
      expect(
        cloudinaryLoader({
          src: "https://example.com/image/upload/pic.jpg",
          width: 640,
          quality: 75,
        }),
      ).toBe("https://example.com/image/upload/pic.jpg");
    });

    it("should pass through a Cloudinary URL with no upload delivery type", () => {
      const src =
        "https://res.cloudinary.com/demo/image/fetch/https://example.com/a.jpg";
      expect(cloudinaryLoader({ src, width: 640, quality: 75 })).toBe(src);
    });
  });

  describe("bare filename after /upload/", () => {
    it("should inject width, quality and format transforms", () => {
      expect(
        cloudinaryLoader({ src: `${CLOUD}/profile.jpg`, width: 640, quality: 75 }),
      ).toBe(`${CLOUD}/w_640,q_75,f_auto/profile.jpg`);
    });

    it("should default quality to auto when omitted", () => {
      expect(cloudinaryLoader({ src: `${CLOUD}/profile.jpg`, width: 320 })).toBe(
        `${CLOUD}/w_320,q_auto,f_auto/profile.jpg`,
      );
    });

    it("should reflect the requested width in the transform", () => {
      const result = cloudinaryLoader({
        src: `${CLOUD}/profile.jpg`,
        width: 1080,
        quality: 90,
      });
      expect(result).toContain("w_1080");
      expect(result).toContain("q_90");
      expect(result).toContain("f_auto");
    });
  });

  describe("versioned and foldered URLs", () => {
    // These are the shapes Cloudinary returns from a real upload, and the
    // ones the previous regex silently passed through at full size.
    it("should inject transforms ahead of a version segment", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/v1712345/profile.jpg`,
          width: 640,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_640,q_75,f_auto/v1712345/profile.jpg`);
    });

    it("should inject transforms ahead of a folder path", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/folder/sub/pic.png`,
          width: 320,
          quality: 80,
        }),
      ).toBe(`${CLOUD}/w_320,q_80,f_auto/folder/sub/pic.png`);
    });

    it("should handle a version followed by a folder", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/v1712345/company_logos/acme.png`,
          width: 800,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_800,q_75,f_auto/v1712345/company_logos/acme.png`);
    });

    it("should treat an underscored folder name as a folder, not a transform", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/company_logos/acme.png`,
          width: 400,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_400,q_75,f_auto/company_logos/acme.png`);
    });

    it("should not mistake a filename beginning with a param key for a transform", () => {
      // `w_banner.jpg` is the public ID, not a `w_` transformation.
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/w_banner.jpg`,
          width: 640,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_640,q_75,f_auto/w_banner.jpg`);
    });
  });

  describe("existing transformation segments", () => {
    it("should replace rather than chain its own params", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/w_100,q_50,f_auto/pic.jpg`,
          width: 640,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_640,q_75,f_auto/pic.jpg`);
    });

    it("should preserve author transformations it does not own", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/c_fill,g_face,w_100/v1/pic.jpg`,
          width: 640,
          quality: 75,
        }),
      ).toBe(`${CLOUD}/w_640,q_75,f_auto,c_fill,g_face/v1/pic.jpg`);
    });

    it("should keep a lone author transformation and add its own params", () => {
      expect(
        cloudinaryLoader({
          src: `${CLOUD}/c_thumb/v1/pic.jpg`,
          width: 200,
          quality: 60,
        }),
      ).toBe(`${CLOUD}/w_200,q_60,f_auto,c_thumb/v1/pic.jpg`);
    });

    it("should emit each owned param exactly once", () => {
      const result = cloudinaryLoader({
        src: `${CLOUD}/w_100,q_50,f_auto/v1/pic.jpg`,
        width: 640,
        quality: 75,
      });

      expect(result.match(/w_/g)).toHaveLength(1);
      expect(result.match(/q_/g)).toHaveLength(1);
      expect(result.match(/f_/g)).toHaveLength(1);
    });
  });

  describe("idempotency", () => {
    it.each([
      ["bare filename", `${CLOUD}/profile.jpg`],
      ["versioned", `${CLOUD}/v1712345/profile.jpg`],
      ["foldered", `${CLOUD}/folder/sub/pic.png`],
      ["already transformed", `${CLOUD}/w_640,q_75,f_auto/v1/pic.jpg`],
      ["author transforms", `${CLOUD}/c_fill,g_face/v1/pic.jpg`],
      ["local path", "/images/logo.svg"],
      ["third party", "https://example.com/pic.jpg"],
    ])("should be stable when re-applied to its own output (%s)", (_label, src) => {
      const once = cloudinaryLoader({ src, width: 640, quality: 75 });
      const twice = cloudinaryLoader({ src: once, width: 640, quality: 75 });

      expect(twice).toBe(once);
    });
  });
});

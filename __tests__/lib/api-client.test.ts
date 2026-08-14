/**
 * Unit Tests for the shared API client
 *
 * Covers apiFetch's envelope/error handling and the attachment normalizers
 * that bridge backend snake_case onto the frontend's compatibility fields.
 */

import {
  apiFetch,
  normalizeAttachment,
  normalizeAttachments,
} from "@/lib/api/client";
import type { BackendAttachment } from "@/types/api";

type MockResponseInit = {
  status?: number;
  ok?: boolean;
  statusText?: string;
  contentType?: string | null;
  body?: unknown;
  text?: string;
};

/** Build a minimal Response-shaped stub for the fetch mock. */
function mockResponse(init: MockResponseInit = {}): Response {
  const status = init.status ?? 200;
  const contentType =
    init.contentType === undefined ? "application/json" : init.contentType;

  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    statusText: init.statusText ?? "OK",
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => init.body,
    text: async () => init.text ?? JSON.stringify(init.body ?? ""),
  } as unknown as Response;
}

const originalFetch = global.fetch;
let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.resetAllMocks();
});

describe("apiFetch", () => {
  describe("successful responses", () => {
    it("should return the parsed JSON payload", async () => {
      const payload = { success: true, message: "ok", data: { id: "1" } };
      mockFetch.mockResolvedValue(mockResponse({ body: payload }));

      await expect(apiFetch("/api/v1/jobs")).resolves.toEqual(payload);
    });

    it("should send credentials so the auth cookie rides along", async () => {
      mockFetch.mockResolvedValue(mockResponse({ body: {} }));

      await apiFetch("/api/v1/jobs");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/jobs",
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("should forward caller-supplied init options", async () => {
      mockFetch.mockResolvedValue(mockResponse({ body: {} }));

      await apiFetch("/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Engineer" }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/v1/jobs",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ role: "Engineer" }),
        }),
      );
    });

    it("should return null for a 204 No Content response", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ status: 204, contentType: null }),
      );

      await expect(apiFetch("/api/v1/jobs/1")).resolves.toBeNull();
    });

    it("should parse a JSON body when the content-type check is skipped", async () => {
      const payload = { success: true, message: "ok", data: null };
      mockFetch.mockResolvedValue(
        mockResponse({ contentType: "text/plain", body: payload }),
      );

      await expect(
        apiFetch("/api/v1/jobs", { skipContentTypeHeaderCheck: true }),
      ).resolves.toEqual(payload);
    });
  });

  describe("error responses", () => {
    it("should throw the message field from an error envelope", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          status: 400,
          statusText: "Bad Request",
          body: { success: false, message: "Email already in use" },
        }),
      );

      await expect(apiFetch("/api/v1/auth/register")).rejects.toThrow(
        "Email already in use",
      );
    });

    it("should fall back to the error field when message is absent", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          status: 403,
          statusText: "Forbidden",
          body: { error: "Access denied" },
        }),
      );

      await expect(apiFetch("/api/v1/admin/users")).rejects.toThrow(
        "Access denied",
      );
    });

    it("should fall back to status text when the body carries no message", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          status: 500,
          statusText: "Internal Server Error",
          body: {},
        }),
      );

      await expect(apiFetch("/api/v1/jobs")).rejects.toThrow(
        "HTTP 500: Internal Server Error",
      );
    });

    it("should ignore a blank message and use the status fallback", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          status: 502,
          statusText: "Bad Gateway",
          body: { message: "   " },
        }),
      );

      await expect(apiFetch("/api/v1/jobs")).rejects.toThrow(
        "HTTP 502: Bad Gateway",
      );
    });

    it("should throw a descriptive error for a non-JSON response", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({
          contentType: "text/html",
          text: "<html>502 Bad Gateway</html>",
        }),
      );

      await expect(apiFetch("/api/v1/jobs")).rejects.toThrow(
        /Server returned non-JSON response/,
      );
    });

    it("should surface a friendly message when the network is unreachable", async () => {
      mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(apiFetch("/api/v1/jobs")).rejects.toThrow(
        /Unable to connect to the server/,
      );
    });

    it("should rethrow non-network errors unchanged", async () => {
      mockFetch.mockRejectedValue(new Error("boom"));

      await expect(apiFetch("/api/v1/jobs")).rejects.toThrow("boom");
    });
  });
});

describe("normalizeAttachment", () => {
  const backendAttachment: BackendAttachment = {
    _id: "abc123",
    name: "resume.pdf",
    url: "https://res.cloudinary.com/demo/raw/upload/resume.pdf",
    file_type: "pdf",
    file_size: 2048,
    upload_date: "2026-05-11T12:00:00.000Z",
    description: "My resume",
  };

  it("should preserve the backend fields verbatim", () => {
    const result = normalizeAttachment(backendAttachment);

    expect(result).toMatchObject({
      _id: "abc123",
      name: "resume.pdf",
      url: "https://res.cloudinary.com/demo/raw/upload/resume.pdf",
      file_type: "pdf",
      file_size: 2048,
      upload_date: "2026-05-11T12:00:00.000Z",
      description: "My resume",
    });
  });

  it("should mirror backend fields onto the frontend compatibility aliases", () => {
    const result = normalizeAttachment(backendAttachment);

    expect(result.id).toBe("abc123");
    expect(result.type).toBe("pdf");
    expect(result.size).toBe(2048);
    expect(result.uploadedAt).toBe("2026-05-11T12:00:00.000Z");
  });

  it("should fall back to the frontend alias when the backend field is absent", () => {
    const result = normalizeAttachment({
      id: "legacy-id",
      name: "cover.docx",
      url: "https://example.com/cover.docx",
      type: "docx",
      size: 512,
      uploadedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(result.id).toBe("legacy-id");
    expect(result.type).toBe("docx");
    expect(result.size).toBe(512);
    expect(result.uploadedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("should carry the preview URL through when present", () => {
    const result = normalizeAttachment({
      ...backendAttachment,
      preview: "https://example.com/preview.png",
    });

    expect(result.preview).toBe("https://example.com/preview.png");
  });

  it("should leave aliases undefined when neither field is present", () => {
    const result = normalizeAttachment({
      name: "bare.txt",
      url: "https://example.com/bare.txt",
    });

    expect(result.id).toBeUndefined();
    expect(result.type).toBeUndefined();
    expect(result.size).toBeUndefined();
    expect(result.uploadedAt).toBeUndefined();
  });

  it("should fall back past a zero file_size to the size alias", () => {
    // Documented consequence of the `||` fallback: a genuine 0-byte
    // file_size is treated as absent.
    const result = normalizeAttachment({
      name: "empty.txt",
      url: "https://example.com/empty.txt",
      file_size: 0,
      size: 99,
    });

    expect(result.file_size).toBe(0);
    expect(result.size).toBe(99);
  });
});

describe("normalizeAttachments", () => {
  it("should normalize every entry in the list", () => {
    const result = normalizeAttachments([
      { _id: "1", name: "a.pdf", url: "https://example.com/a.pdf", file_type: "pdf" },
      { _id: "2", name: "b.doc", url: "https://example.com/b.doc", file_type: "doc" },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].type).toBe("doc");
  });

  it("should return an empty array for an empty list", () => {
    expect(normalizeAttachments([])).toEqual([]);
  });

  it("should return an empty array when given a non-array", () => {
    expect(
      normalizeAttachments(null as unknown as BackendAttachment[]),
    ).toEqual([]);
    expect(
      normalizeAttachments(undefined as unknown as BackendAttachment[]),
    ).toEqual([]);
  });
});

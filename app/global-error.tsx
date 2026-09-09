"use client";

/**
 * Last-resort boundary for errors in the root layout itself. Must render its
 * own <html>/<body> because the layout that normally provides them crashed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#fff",
          color: "#1f2937",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center", padding: "1rem" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ lineHeight: 1.6, marginBottom: "2rem", color: "#4b5563" }}>
            The site hit a problem on our side. Trying again usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              minHeight: "48px",
              borderRadius: "9999px",
              background: "#e53e3e",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

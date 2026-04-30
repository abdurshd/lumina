import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

interface OgImageOptions {
  /** Eyebrow / category label rendered above the title — e.g. "Pricing", "Security & Privacy". */
  eyebrow?: string;
  /** Main headline. Up to ~80 characters renders well at the chosen size. */
  title: string;
  /** Optional supporting line below the title. */
  subtitle?: string;
}

/**
 * Brand-consistent OG image template. Used by `opengraph-image.tsx` files in
 * every public route to generate per-route social cards at request time.
 * Next.js caches them based on the file's contents.
 */
export function renderOgImage({ eyebrow, title, subtitle }: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a1410 100%)",
          padding: 80,
          fontFamily: '"Outfit", system-ui, -apple-system, sans-serif',
          color: "#f5f5f5",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={32}
              height={32}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#f5f5f5",
            }}
          >
            Lumina
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 22,
                fontWeight: 500,
                color: "#22c55e",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 24,
              }}
            >
              {eyebrow}
            </div>
          )}

          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fafafa",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                marginTop: 28,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.35,
                color: "#a1a1aa",
                maxWidth: 920,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <div>lumina.app</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#22c55e",
              }}
            />
            Evidence-grounded talent discovery
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}

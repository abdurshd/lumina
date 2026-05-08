import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina for HR teams";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "For HR teams",
    title: "Internal mobility, grounded in actual evidence.",
    subtitle:
      "Confidence-weighted employee profiles. Strict data boundaries. BYOK supported.",
  });
}

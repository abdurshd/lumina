import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina methodology — RIASEC, Big Five, and confidence scoring";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Methodology",
    title: "How Lumina arrives at a recommendation.",
    subtitle:
      "RIASEC interests, Big Five facets, O*NET careers, and a 5-step self-correcting report agent — citations included.",
  });
}

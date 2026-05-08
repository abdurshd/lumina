import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina for career pivots";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "For career pivots",
    title: "Make a serious career change without starting from zero.",
    subtitle:
      "A pivot assessment built on your existing depth — not a from-scratch search.",
  });
}

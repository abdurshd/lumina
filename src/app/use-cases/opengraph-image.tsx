import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina use cases";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Use cases",
    title: "Five ways people actually use Lumina.",
    subtitle:
      "Career pivots, new-grad direction, returning to work, coaching, and direction-checks.",
  });
}

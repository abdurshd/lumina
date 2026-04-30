import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina Lab — public benchmarks";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Lumina Lab",
    title: "Live regression metrics. No cherry-picking.",
    subtitle:
      "Recomputed every page load — RIASEC accuracy, cluster overlap, stability, and bias.",
  });
}

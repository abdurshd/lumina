import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina careers — all 16 O*NET clusters";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Careers",
    title: "All 16 O*NET career clusters.",
    subtitle:
      "Browse RIASEC codes, example careers, and the Lumina dimensions that predict fit.",
  });
}

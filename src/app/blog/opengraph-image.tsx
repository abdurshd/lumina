import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina blog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Blog",
    title: "Notes from the Lumina team.",
    subtitle:
      "Methodology, engineering decisions, and the principles behind evidence-grounded talent discovery.",
  });
}

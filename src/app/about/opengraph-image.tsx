import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "About Lumina";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "About",
    title: "Building the talent map careers actually need.",
    subtitle:
      "Why Lumina exists, what we believe, and how we work — small team, long horizon.",
  });
}

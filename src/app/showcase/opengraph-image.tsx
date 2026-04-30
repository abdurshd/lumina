import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina showcase — anonymized public reports";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Showcase",
    title: "What a Lumina report actually looks like.",
    subtitle:
      "Anonymized, owner-published reports. Privacy-preserving by default.",
  });
}

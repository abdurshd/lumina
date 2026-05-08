import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina for self-discovery";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "For self-discovery",
    title: "Find out what you should be doing.",
    subtitle:
      "A confidence-weighted talent profile from your real digital footprint — not a personality label.",
  });
}

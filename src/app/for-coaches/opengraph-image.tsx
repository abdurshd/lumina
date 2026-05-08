import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina for coaches";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "For coaches",
    title: "Skip the data-gathering. Start with judgment.",
    subtitle:
      "Coach mode for up to 5 clients, shareable PDF reports, read-only API.",
  });
}

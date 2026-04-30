import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina help center";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Help center",
    title: "Answers to the most common Lumina questions.",
    subtitle:
      "Getting started, connections, the assessment, the live session, reports, billing, and account controls.",
  });
}

import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina security and privacy posture";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Security & Privacy",
    title: "Connect your real life without giving it away.",
    subtitle:
      "Ephemeral session tokens, deny-by-default rules, transient raw content, and consent-only behavioral inference.",
  });
}

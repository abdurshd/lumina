import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina for higher-ed career services";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "For higher ed",
    title: "Career services that scales — without scripted advice.",
    subtitle:
      "Evidence-grounded student profiles, cohort visibility, privacy-first by design.",
  });
}

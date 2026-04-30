import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina — Evidence-grounded talent discovery";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    title: "Discover what your data already shows about you.",
    subtitle:
      "Lumina synthesizes your digital footprint, an adaptive assessment, and a live AI conversation into one evidence-grounded talent profile.",
  });
}

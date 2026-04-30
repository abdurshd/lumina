import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Lumina pricing — credit-based plans";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Pricing",
    title: "You pay for the AI work you actually use.",
    subtitle:
      "Three credit-based plans. Cancel anytime. 7-day refund on the first month.",
  });
}

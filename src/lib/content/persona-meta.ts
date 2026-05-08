import type { Metadata } from "next";
import { getPersona, type Persona } from "./personas";

/**
 * Build a Next.js Metadata object for a persona route, used by each
 * `/for-{slug}/page.tsx`. Centralized so the static routes stay tiny and
 * stay in sync with the persona content layer.
 */
export function buildPersonaMetadata(slug: Persona["slug"]): Metadata {
  const persona = getPersona(slug);
  if (!persona) {
    return { title: "Persona not found — Lumina", robots: { index: false } };
  }

  return {
    title: `${persona.title} — Lumina`,
    description: persona.description,
    openGraph: {
      title: persona.title,
      description: persona.description,
      type: "website",
    },
  };
}

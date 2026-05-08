import { PersonaPageBody } from "@/components/personas/persona-page";
import { buildPersonaMetadata } from "@/lib/content/persona-meta";

export const metadata = buildPersonaMetadata("career-pivots");

export default function ForCareerPivotsPage() {
  return <PersonaPageBody slug="career-pivots" />;
}

import { PersonaPageBody } from "@/components/personas/persona-page";
import { buildPersonaMetadata } from "@/lib/content/persona-meta";

export const metadata = buildPersonaMetadata("coaches");

export default function ForCoachesPage() {
  return <PersonaPageBody slug="coaches" />;
}

import { PersonaPageBody } from "@/components/personas/persona-page";
import { buildPersonaMetadata } from "@/lib/content/persona-meta";

export const metadata = buildPersonaMetadata("schools");

export default function ForSchoolsPage() {
  return <PersonaPageBody slug="schools" />;
}

import { PersonaPageBody } from "@/components/personas/persona-page";
import { buildPersonaMetadata } from "@/lib/content/persona-meta";

export const metadata = buildPersonaMetadata("hr-teams");

export default function ForHrTeamsPage() {
  return <PersonaPageBody slug="hr-teams" />;
}

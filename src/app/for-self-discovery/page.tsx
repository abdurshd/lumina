import { PersonaPageBody } from "@/components/personas/persona-page";
import { buildPersonaMetadata } from "@/lib/content/persona-meta";

export const metadata = buildPersonaMetadata("self-discovery");

export default function ForSelfDiscoveryPage() {
  return <PersonaPageBody slug="self-discovery" />;
}

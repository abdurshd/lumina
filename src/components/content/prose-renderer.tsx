import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ProseSection } from "@/lib/content/prose";

const CALLOUT_STYLES: Record<
  NonNullable<ProseSection["callout"]>["variant"],
  { container: string; iconWrap: string; Icon: typeof Info }
> = {
  info: {
    container: "border-primary/20 bg-primary/5",
    iconWrap: "text-primary",
    Icon: Info,
  },
  warn: {
    container: "border-amber-500/30 bg-amber-500/5",
    iconWrap: "text-amber-500",
    Icon: AlertTriangle,
  },
  success: {
    container: "border-emerald-500/30 bg-emerald-500/5",
    iconWrap: "text-emerald-500 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
};

interface ProseRendererProps {
  sections: ProseSection[];
}

export function ProseRenderer({ sections }: ProseRendererProps) {
  return (
    <div className="space-y-12">
      {sections.map((section, i) => (
        <section
          key={(section.heading ?? "section") + i}
          className="space-y-4"
        >
          {section.heading && (
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
          )}
          {section.paragraphs.map((para, pi) => (
            <p
              key={pi}
              className="text-base leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
          {section.list && section.list.length > 0 && (
            <ul className="space-y-2 text-base text-foreground">
              {section.list.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
          {section.callout && (
            <Callout {...section.callout} />
          )}
        </section>
      ))}
    </div>
  );
}

function Callout({
  variant,
  text,
}: NonNullable<ProseSection["callout"]>) {
  const { container, iconWrap, Icon } = CALLOUT_STYLES[variant];
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${container}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconWrap}`} />
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

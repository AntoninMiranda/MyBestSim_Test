import type { ReactNode } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  /** Sections d'analyse : fond bleuté, liseré bleu marine → bleu. */
  blue: {
    card: "bg-section",
    bar: "bg-[linear-gradient(90deg,#1E3A8A_0%,#1E40AF_50%,#4589FF_100%)]",
  },
  /** Section d'action (import) : fond chaud, liseré rouge → ambre. */
  warm: {
    card: "bg-section-warm",
    bar: "bg-[linear-gradient(90deg,#EF4444_0%,#DC2626_40%,#F59E0B_100%)]",
  },
} as const;

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  /** Élément aligné à droite du titre (légende, badge…). */
  action?: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}

/** Carte de section du design system : arrondi 16 px, ombre bleutée, liseré coloré en haut, titre h2 relié par aria-labelledby. */
export function SectionCard({ id, title, subtitle, action, tone = "blue", className, children }: SectionCardProps) {
  return (
    <Card
      role="region"
      aria-labelledby={id}
      className={cn(
        "relative gap-[18px] rounded-[16px] pt-[30px] pb-7 shadow-section ring-0 [--card-spacing:--spacing(7)]",
        TONES[tone].card,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[5px]", TONES[tone].bar)} />
      <CardHeader>
        <CardTitle>
          <h2 id={id} className="text-xl font-extrabold text-navy">
            {title}
          </h2>
        </CardTitle>
        {subtitle && <CardDescription className="leading-relaxed">{subtitle}</CardDescription>}
        {action && <CardAction className="self-center">{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-[18px]">{children}</CardContent>
    </Card>
  );
}

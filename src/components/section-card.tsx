import type { ReactNode } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  /** Élément aligné à droite du titre (légende, badge…). */
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/** Carte de section de la maquette : grands arrondis, ombre douce, titre h2 relié par aria-labelledby. */
export function SectionCard({ id, title, subtitle, action, className, contentClassName, children }: SectionCardProps) {
  return (
    <Card
      role="region"
      aria-labelledby={id}
      className={cn(
        "gap-[18px] rounded-[28px] shadow-[0_22px_60px_rgb(15_23_42/6%)] ring-border [--card-spacing:--spacing(7)]",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>
          <h2 id={id} className="text-xl font-semibold">
            {title}
          </h2>
        </CardTitle>
        {subtitle && <CardDescription className="leading-relaxed">{subtitle}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("flex flex-1 flex-col gap-[18px]", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

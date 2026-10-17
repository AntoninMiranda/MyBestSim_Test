import type { ReactNode } from "react";
import Link from "next/link";
import { CardSim } from "lucide-react";

interface SiteHeaderProps {
  homeHref: string;
  homeLabel: string;
  /** Élément aligné à droite du logo (sélecteur de langue…). */
  children?: ReactNode;
}

/** En-tête commun : logo MyBestSim à gauche, contenu libre à droite. */
export function SiteHeader({ homeHref, homeLabel, children }: SiteHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-4">
        <Link href={homeHref} aria-label={homeLabel} className="flex items-center gap-2.5 text-navy">
          <span className="flex size-[38px] items-center justify-center rounded-[10px] bg-brand">
            <CardSim className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-[21px] font-extrabold tracking-tight">
            MyBest<span className="text-brand">Sim</span>
          </span>
        </Link>
        {children}
      </div>
    </header>
  );
}

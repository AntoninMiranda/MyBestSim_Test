import { notFound } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Separator } from "@/components/ui/separator";
import { computeStats } from "@/domain/stats";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { loadSampleCatalog } from "@/infrastructure/load-sample.server";

const REPO_URL = "https://github.com/AntoninMiranda/MyBestSim_Test";

// Calculé une seule fois au chargement du module (au build) : les fichiers d'exemple ne changent pas entre deux requêtes.
const sample = loadSampleCatalog();
const sampleStats = computeStats(sample.products);

export default async function DashboardPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{dict.header.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{dict.header.title}</h1>
        </div>
        <LocaleSwitcher current={lang} label={dict.header.language} />
      </header>

      <DashboardClient
        initialStats={sampleStats}
        initialReport={sample.report}
        sampleFileNames={sample.fileNames}
        dict={dict}
        locale={lang}
      />

      <Separator />
      <footer className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <p>{dict.footer.source}</p>
        <a href={REPO_URL} className="underline underline-offset-4 hover:text-foreground">
          {dict.footer.code}
        </a>
      </footer>
    </main>
  );
}

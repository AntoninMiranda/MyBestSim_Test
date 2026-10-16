import Link from "next/link";
import { notFound } from "next/navigation";
import { CardSim, Upload } from "lucide-react";
import { DashboardClient } from "@/components/dashboard-client";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
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
    <>
      <header className="border-b border-brand-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-[18px]">
          <Link href={`/${lang}`} aria-label={dict.header.home} className="flex items-center gap-2.5">
            <span className="flex size-[38px] items-center justify-center rounded-xl bg-brand">
              <CardSim className="size-5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[21px] font-bold tracking-tight">
              MyBest<span className="text-brand-strong">Sim</span>
            </span>
          </Link>
          <LocaleSwitcher current={lang} label={dict.header.language} names={dict.header.languages} />
        </div>
      </header>

      <section className="border-b border-brand-line bg-secondary">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end gap-8 px-6 pt-14 pb-12">
          <h1 className="min-w-0 flex-[999_1_560px] text-[34px] leading-tight font-bold tracking-tight sm:text-[46px] sm:leading-[1.1]">
            {dict.hero.title} <span className="text-brand-strong">{dict.hero.titleAccent}</span>
          </h1>
          <div className="flex flex-[1_1_280px] flex-wrap justify-end gap-3">
            <Button asChild className="h-12 rounded-full px-6 text-[15px] font-semibold shadow-[0_10px_24px_rgb(3_105_161/25%)]">
              <a href="#import">
                <Upload aria-hidden="true" />
                {dict.hero.importCta}
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-[22px] text-[15px] font-semibold">
              <a href="#quality">{dict.hero.qualityCta}</a>
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1240px] px-6 pt-10 pb-[72px]">
        <DashboardClient
          initialStats={sampleStats}
          initialReport={sample.report}
          sampleFileNames={sample.fileNames}
          dict={dict}
          locale={lang}
        />
      </main>

      <footer className="bg-foreground text-slate-300">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-6 py-8 text-sm">
          <p>
            <strong className="text-white">MyBestSim</strong> · {dict.footer.source}
          </p>
          <a href={REPO_URL} className="text-sky-300 underline underline-offset-4 hover:text-sky-200">
            {dict.footer.code}
          </a>
        </div>
      </footer>
    </>
  );
}

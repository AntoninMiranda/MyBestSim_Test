import { notFound } from "next/navigation";
import { Upload } from "lucide-react";
import { DashboardClient } from "@/components/dashboard-client";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiteHeader } from "@/components/site-header";
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
      <SiteHeader homeHref={`/${lang}`} homeLabel={dict.header.home}>
        <LocaleSwitcher current={lang} label={dict.header.language} names={dict.header.languages} />
      </SiteHeader>

      <section className="bg-hero border-b border-blue-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end gap-8 px-6 pt-[52px] pb-11">
          <h1 className="min-w-0 flex-[999_1_560px] text-[34px] leading-tight font-extrabold tracking-tight text-navy sm:text-[44px] sm:leading-[1.12]">
            {dict.hero.title} <span className="text-brand">{dict.hero.titleAccent}</span>
          </h1>
          <div className="flex flex-[1_1_280px] flex-wrap justify-end gap-3">
            <Button
              asChild
              className="bg-cta-red h-12 rounded-[25px] px-[26px] text-[15px] font-bold shadow-[0_4px_14px_rgb(239_68_68/35%),inset_0_1px_0_rgb(255_255_255/15%)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_25px_rgb(239_68_68/45%)] motion-safe:hover:-translate-y-[3px]"
            >
              <a href="#import">
                <Upload aria-hidden="true" />
                {dict.hero.importCta}
              </a>
            </Button>
            <Button
              asChild
              className="bg-cta-navy h-12 rounded-[25px] px-6 text-[15px] font-bold shadow-[0_4px_14px_rgb(30_64_175/30%),inset_0_1px_0_rgb(255_255_255/15%)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_25px_rgb(30_64_175/35%)] motion-safe:hover:-translate-y-0.5"
            >
              <a href="#quality">{dict.hero.qualityCta}</a>
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1240px] px-6 pt-10 pb-[72px]">
        <DashboardClient
          initialStats={sampleStats}
          initialReport={sample.report}
          dict={dict}
          locale={lang}
        />
      </main>

      <footer className="bg-navy-gradient text-blue-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-6 py-[30px] text-sm">
          <p>
            <strong className="font-extrabold text-white">MyBestSim</strong> · {dict.footer.source}
          </p>
          <a href={REPO_URL} className="font-bold text-white underline-offset-4 hover:underline">
            {dict.footer.code}
          </a>
        </div>
      </footer>
    </>
  );
}

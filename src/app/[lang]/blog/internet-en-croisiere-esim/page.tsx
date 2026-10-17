import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/site-url";

// Article en français uniquement : la route /en/... renvoie une 404.
const LANG = "fr";
const PATH = "/fr/blog/internet-en-croisiere-esim";
const TITLE = "Internet en croisière : quelle eSIM choisir en 2026 ?";
const DESCRIPTION =
  "En mer, en escale, dans l’UE ou hors UE : quelle eSIM prendre pour votre croisière, combien de data prévoir et comment éviter les 15 €/Mo du réseau maritime.";
const PUBLISHED = "2026-10-18";
const MODIFIED = "2026-10-18";
const MBS = "https://mybestsim.com/fr";

const SOURCES = {
  jechange: "https://www.jechange.fr/telecom/mobile/news/itinerance-maritime-10-16-euros-megaoctet-ferry-reglage-embarquer",
  cruiseFever: "https://cruisefever.net/wi-fi-on-a-cruise-ship-cost-of-internet-for-each-cruise-line/",
  cruiseCritic: "https://www.cruisecritic.com/articles/what-is-starlink-and-which-cruise-ships-use-starlink-internet",
  gigsky: "https://www.gigsky.com/blog/cruise-internet-costs-compared-wifi-vs-esim-plans",
  roamingRegulation: "https://eur-lex.europa.eu/eli/reg/2022/612/oj",
};

// Source unique de la FAQ : affichée dans la page et reprise dans le balisage FAQPage.
const FAQ = [
  {
    q: "Mon forfait français fonctionne-t-il sur un bateau de croisière ?",
    a: "À quai et près des côtes européennes, oui, au tarif de votre forfait. En pleine mer, votre téléphone se connecte à l’antenne du bateau, facturée hors forfait entre 9,70 € et 15,84 € le Mo selon l’opérateur. Passez en mode avion dès que le bateau quitte le port.",
  },
  {
    q: "Une eSIM fonctionne-t-elle en pleine mer ?",
    a: "Une eSIM de voyage classique, non : elle utilise les antennes à terre, qui ne portent qu’à 15 ou 20 km des côtes. Seules les eSIM spéciales croisière, comme GigSky, fonctionnent en mer, et uniquement sur les navires partenaires. Vérifiez votre bateau avant d’acheter.",
  },
  {
    q: "Combien coûte le Wi-Fi sur un bateau de croisière ?",
    a: "En 2026, comptez de 16 $ par jour (MSC) à environ 30 $ par jour (Royal Caribbean, Norwegian) pour un appareil, et jusqu’à 45 $ pour le streaming. Le forfait couvre en général toute la croisière. Il est souvent moins cher réservé avant l’embarquement.",
  },
  {
    q: "Peut-on appeler avec une eSIM data en croisière ?",
    a: "Oui, via WhatsApp, FaceTime ou Messenger, qui passent par les données. La plupart des eSIM de voyage ne donnent pas de numéro de téléphone. Pour recevoir des appels sur votre numéro français, gardez votre ligne active : la réception d’appels hors UE peut être facturée.",
  },
  {
    q: "Faut-il une eSIM pour une croisière en Méditerranée ?",
    a: "Seulement si une escale est hors UE : Maroc, Tunisie, Turquie, Monténégro ou Égypte. Pour les escales en Espagne, en Italie, en Grèce, en Croatie ou à Malte, votre forfait français fonctionne sans surcoût grâce à l’itinérance européenne.",
  },
];

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/internet-en-croisiere-esim">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== LANG) return {};
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PATH, languages: { fr: PATH } },
    openGraph: {
      type: "article",
      title: TITLE,
      description: DESCRIPTION,
      url: PATH,
      locale: "fr_FR",
      publishedTime: PUBLISHED,
      modifiedTime: MODIFIED,
    },
  };
}

const publisher = { "@type": "Organization", name: "MyBestSim", url: "https://mybestsim.com" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: "fr-FR",
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      author: { "@type": "Organization", name: "La rédaction MyBestSim", url: "https://mybestsim.com" },
      publisher,
      mainEntityOfPage: `${siteUrl}${PATH}`,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/fr` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${MBS}/blog/` },
        { "@type": "ListItem", position: 3, name: TITLE, item: `${siteUrl}${PATH}` },
      ],
    },
  ],
};

/** Réponse courte en tête de section (40 à 60 mots), pensée pour l'extrait Google et les moteurs IA. */
function Answer({ children }: { children: ReactNode }) {
  return (
    <p className="answer">
      <strong>{children}</strong>
    </p>
  );
}

function Table({ head, rows, caption }: { head: string[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="table-wrap">
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Emplacement d'image suggéré (le livrable propose les visuels sans les produire). */
function ImageSuggestion({ children, alt }: { children: ReactNode; alt: string }) {
  return (
    <figure>
      <p>
        <strong>Image suggérée :</strong> {children}
      </p>
      <figcaption className="mt-1">Texte alternatif : « {alt} »</figcaption>
    </figure>
  );
}

export default async function CruiseArticlePage({ params }: PageProps<"/[lang]/blog/internet-en-croisiere-esim">) {
  const { lang } = await params;
  if (lang !== LANG) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader homeHref="/fr" homeLabel="Accueil MyBestSim" />

      <main className="mx-auto w-full max-w-[760px] px-6 pt-8 pb-20">
        <nav aria-label="Fil d’Ariane" className="text-[14px] text-muted-foreground">
          <Link href="/fr" className="hover:underline">Accueil</Link> › <a href={`${MBS}/blog/`} className="hover:underline">Blog</a> › Croisière
        </nav>

        <article className="article">
          <header className="mt-6 mb-8">
            <h1 className="text-[32px] leading-tight font-extrabold tracking-tight text-navy sm:text-[40px]">{TITLE}</h1>
            <p className="note mt-3">
              Mis à jour le <time dateTime={MODIFIED}>18 octobre 2026</time> · Par la rédaction MyBestSim · Lecture : 10 min
            </p>
          </header>

          <Answer>
            En pleine mer, aucune eSIM de voyage classique ne capte : seuls le Wi-Fi du bateau ou une eSIM spéciale croisière
            comme GigSky fonctionnent. Aux escales dans l’Union européenne, votre forfait français suffit. Hors UE (Maroc,
            Turquie, Caraïbes), prenez une eSIM de 3 à 5 Go, et passez en mode avion dès que le bateau quitte le port.
          </Answer>

          <ImageSuggestion alt="Smartphone en mode avion à bord d’un bateau de croisière">
            paquebot au large, smartphone au premier plan avec l’icône « mode avion ».
          </ImageSuggestion>

          <h2 id="solution-par-croisiere">La bonne solution selon votre croisière</h2>
          <Table
            caption="Solution internet recommandée selon l’itinéraire de croisière"
            head={["Votre croisière", "En mer", "Aux escales", "Budget indicatif"]}
            rows={[
              ["Méditerranée, escales uniquement dans l’UE", "Mode avion, ou Wi-Fi du bateau", "Votre forfait français", "0 €"],
              ["Méditerranée avec Maroc, Tunisie, Turquie ou Monténégro", "Mode avion, ou Wi-Fi du bateau", "Forfait français dans l’UE, eSIM pour les escales hors UE", "~10 à 14 €"],
              ["Fjords de Norvège, Islande", "Mode avion, ou Wi-Fi du bateau", "Votre forfait français (EEE)", "0 €"],
              ["Caraïbes (hors Antilles françaises)", "Wi-Fi du bateau, ou eSIM spéciale croisière", "eSIM « Monde » ou multi-pays", "~18 €"],
              ["Alaska, États-Unis, Canada", "Wi-Fi du bateau, ou eSIM spéciale croisière", "eSIM « Amérique du Nord »", "~17 à 18 €"],
              ["Transatlantique, tour du monde", "Wi-Fi du bateau", "eSIM « Monde »", "~18 à 32 €"],
              ["Vous devez travailler en mer", "Forfait Wi-Fi du bateau avec streaming", "Selon les escales", "21 à 45 $ par jour"],
            ]}
          />
          <p className="note">
            Les budgets eSIM sont des prix médians issus de notre analyse de 5 056 forfaits (méthode plus bas). Les prix du
            Wi-Fi viennent des grilles publiques des compagnies.
          </p>

          <h2 id="pourquoi-pas-de-reseau-en-mer">Pourquoi internet ne passe pas en pleine mer ?</h2>
          <Answer>
            Votre téléphone capte les antennes terrestres jusqu’à environ 15 à 20 km des côtes. Au-delà, il n’y a plus de
            réseau mobile classique. Les seules connexions possibles passent par le satellite du bateau : soit son Wi-Fi
            payant, soit son antenne mobile embarquée, facturée en itinérance maritime.
          </Answer>
          <p>
            Une eSIM de voyage, qu’elle vienne d’Airalo, de Saily ou d’Ubigi, s’appuie sur les opérateurs à terre. Elle se
            comporte donc exactement comme votre carte SIM française : elle marche dans le port, puis le signal faiblit à
            mesure que le bateau s’éloigne et finit par disparaître.
          </p>
          <p>À bord, deux réseaux prennent le relais :</p>
          <ul>
            <li>
              <strong>Le Wi-Fi du navire.</strong> Il passe par satellite, et de plus en plus par Starlink : Royal Caribbean,
              MSC, Norwegian, Celebrity et Princess l’ont déployé sur leur flotte (<a href={SOURCES.cruiseCritic}>Cruise Critic</a>).
              Les débits sont devenus corrects, les prix beaucoup moins.
            </li>
            <li>
              <strong>L’antenne mobile du bateau.</strong> Des sociétés comme Telenor Maritime installent un vrai réseau mobile
              à bord. Votre téléphone s’y connecte tout seul, comme à n’importe quel réseau étranger, et c’est là que la facture
              s’envole.
            </li>
          </ul>
          <ImageSuggestion alt="Zones de couverture d’un téléphone en croisière">
            schéma de la couverture. Réseau terrestre jusqu’à ~20 km de la côte, puis satellite du bateau au-delà.
          </ImageSuggestion>

          <h2 id="itinerance-maritime">Combien coûte l’itinérance maritime avec un forfait français ?</h2>
          <Answer>
            Entre 9,70 € et 15,84 € le mégaoctet selon votre opérateur (JeChange, octobre 2026). Une seule photo de 3 Mo
            envoyée sur WhatsApp coûte donc de 29 à 48 €. Ce réseau n’est couvert par aucun forfait, ni par l’itinérance
            européenne gratuite.
          </Answer>
          <p>
            Les tarifs hors forfait relevés le 29 septembre 2026 dans les brochures des opérateurs (
            <a href={SOURCES.jechange}>JeChange, 10 octobre 2026</a>) :
          </p>
          <Table
            caption="Tarifs de l’itinérance maritime par opérateur français"
            head={["Opérateur", "Prix du Mo en zone maritime", "Protection par défaut"]}
            rows={[
              ["Free", "9,70 €", "Option à 9,70 € par jour pour 1 Go sur certaines liaisons, avec les forfaits Free 5G+ et Free Max"],
              ["Bouygues Telecom", "14 €", "Internet bloqué à 60 € hors Europe"],
              ["SFR", "15,84 €", "Internet coupé dès 0 € en zone satellitaire, sauf si vous levez le blocage"],
              ["Orange, Sosh", "Non publié", "Le SMS reçu à l’entrée en zone maritime fait foi"],
            ]}
          />
          <p>
            Le blocage de SFR et le plafond de Bouygues limitent la casse, mais 60 € pour quelques mégaoctets, c’est cher
            payé. Et une application qui se met à jour en arrière-plan n’attend pas votre accord.
          </p>
          <p>
            <strong>Les 4 réglages à faire avant que le bateau ne quitte le port :</strong>
          </p>
          <ol>
            <li>
              Désactivez l’itinérance des données (iPhone : <em>Réglages &gt; Données cellulaires &gt; Options</em> ; Android :{" "}
              <em>Paramètres &gt; Connexions &gt; Réseaux mobiles</em>).
            </li>
            <li>Passez en mode avion, puis réactivez uniquement le Wi-Fi si vous avez un forfait à bord.</li>
            <li>Coupez la sauvegarde automatique des photos (iCloud, Google Photos) et les mises à jour automatiques des applications.</li>
            <li>Vérifiez dans votre espace client que le blocage hors forfait est actif.</li>
          </ol>
          <ImageSuggestion alt="Itinérance des données désactivée sur iPhone et Android">
            capture des réglages iPhone et Android avec « Itinérance des données » désactivée.
          </ImageSuggestion>

          <h2 id="croisiere-en-europe">Faut-il une eSIM si votre croisière reste en Europe ?</h2>
          <Answer>
            Non, dans la plupart des cas. Depuis le règlement européen (UE) 2022/612, votre forfait français fonctionne sans
            surcoût dans les 27 pays de l’UE, en Norvège, en Islande et au Liechtenstein, ainsi que dans les Antilles
            françaises. Une eSIM ne sert que pour les escales hors de cette zone, ou si votre volume « Europe » est trop petit.
          </Answer>
          <p>
            C’est la question que les vendeurs d’eSIM évitent. Une croisière Marseille, Barcelone, Naples, Santorin et La
            Valette ne demande aucune eSIM : toutes les escales sont dans l’UE, et votre forfait s’y comporte comme en France
            (règle « roam like at home », prolongée jusqu’en 2032 par le{" "}
            <a href={SOURCES.roamingRegulation}>règlement (UE) 2022/612</a>).
          </p>
          <p>Deux limites à vérifier dans votre contrat :</p>
          <ul>
            <li>
              <strong>Le volume utilisable en Europe</strong> peut être inférieur à votre volume en France. Sur un forfait de
              200 Go, la part « Europe » est souvent bien plus faible. Elle figure dans la fiche tarifaire, à la ligne « Europe
              et DOM ».
            </li>
            <li>
              <strong>Le réseau du bateau n’est pas l’Europe.</strong> Même à 30 km de Barcelone, si votre téléphone accroche
              l’antenne du navire, vous payez le tarif maritime.
            </li>
          </ul>
          <p>
            Les escales hors UE sont plus fréquentes qu’on ne le croit en Méditerranée : Tanger et Casablanca au Maroc, Tunis
            (La Goulette), Kotor au Monténégro, Istanbul, Kuşadası et Bodrum en Turquie. Monaco et Gibraltar sont un cas à
            part : ils ne sont pas couverts par le règlement, même si la plupart des opérateurs français les incluent.
            Regardez la liste des destinations de votre forfait avant de partir.
          </p>

          <h2 id="esim-par-itineraire">Quelle eSIM choisir selon votre itinéraire ?</h2>
          <Answer>
            Pour une ou deux escales dans le même pays hors UE, prenez un forfait pays. Dès que vos escales hors UE touchent
            deux pays ou plus, un forfait régional ou « Monde » devient moins cher que plusieurs forfaits séparés.
          </Answer>

          <h3>Méditerranée</h3>
          <p>
            Si une seule escale sort de l’UE, un forfait pays de 3 Go suffit : comptez 10,08 € en médiane pour le Maroc (3 Go,
            7 jours) dans notre analyse. Avec deux pays hors UE, par exemple le Monténégro puis la Turquie, un forfait couvrant
            les deux revient moins cher. Attention : les forfaits « Europe » des fournisseurs n’incluent pas toujours le Maroc,
            la Tunisie ou la Turquie. Vérifiez la liste des pays avant d’acheter. Pour comparer :{" "}
            <a href={`${MBS}/comparaison-meilleure-carte-esim-turquie/`}>eSIM Turquie</a>,{" "}
            <a href={`${MBS}/comparaison-meilleure-carte-esim-tunisie/`}>eSIM Tunisie</a>,{" "}
            <a href={`${MBS}/comparaison-meilleure-carte-esim-montenegro/`}>eSIM Monténégro</a>.
          </p>

          <h3>Europe du Nord et fjords</h3>
          <p>
            La Norvège et l’Islande font partie de l’Espace économique européen : votre forfait français y fonctionne. Seules
            les escales au Royaume-Uni (Southampton, Édimbourg) et aux îles Féroé méritent une vérification, car elles sont
            hors du règlement européen. Le vrai sujet sur ces croisières, ce sont les longues journées de navigation entre deux
            fjords, où seul le Wi-Fi du bord fonctionne. Plus d’informations sur notre page{" "}
            <a href={`${MBS}/comparaison-meilleure-carte-esim-norvege/`}>eSIM Norvège</a>.
          </p>

          <h3>Caraïbes</h3>
          <p>
            C’est l’itinéraire où l’eSIM rapporte le plus. Une croisière type enchaîne quatre ou cinq pays différents (Bahamas,
            Jamaïque, République dominicaine, îles Vierges…), et acheter un forfait par île devient vite absurde. Un forfait
            « Monde » de 5 Go sur 15 jours coûte 18,25 € en médiane. Exception : la Guadeloupe, la Martinique et la partie
            française de Saint-Martin sont des territoires français, couverts par votre forfait. Voir l’
            <a href={`${MBS}/comparaison-meilleure-carte-esim-monde/`}>eSIM Monde</a>.
          </p>

          <h3>Alaska et Amérique du Nord</h3>
          <p>
            Les croisières en Alaska alternent ports américains et canadiens (Vancouver, Victoria). Un forfait « Amérique du
            Nord » couvre les deux pays : 16,85 € en médiane pour 5 Go sur 7 jours. Si la croisière ne touche que les
            États-Unis, un forfait pays est moins cher. Voir l’
            <a href={`${MBS}/comparaison-meilleure-carte-esim-etats-unis/`}>eSIM États-Unis</a>.
          </p>

          <h3>Transatlantique et tour du monde</h3>
          <p>
            Sur une transatlantique, vous passez une semaine en mer pour une ou deux escales. Le budget se joue sur le Wi-Fi du
            bateau, pas sur l’eSIM. Pour un tour du monde, un forfait « Monde » de 10 Go sur 30 jours coûte 32,33 € en
            médiane, à racheter tous les mois.
          </p>

          <h3>Forfait pays ou forfait régional : ce que disent nos données</h3>
          <p>
            Nous avons comparé les prix médians de 5 056 forfaits eSIM proposés par 18 fournisseurs (dont Airalo, Holafly,
            Ubigi, Saily et GigSky), à volume et durée identiques.
          </p>
          <Table
            caption="Prix médian d’une eSIM selon la zone couverte"
            head={["Forfait", "Un pays", "Zone Europe", "Zone Monde"]}
            rows={[
              ["3 Go / 7 jours", "9,48 €", "13,64 €", "13,63 €"],
              ["5 Go / 7 jours", "12,29 €", "16,77 €", "17,11 €"],
              ["5 Go / 15 jours", "13,66 €", "18,24 €", "18,25 €"],
              ["10 Go / 15 jours", "20,11 €", "27,57 €", "28,38 €"],
            ]}
          />
          <p>Deux enseignements :</p>
          <ul>
            <li>
              <strong>Un forfait régional coûte environ 35 à 45 % de plus qu’un forfait pays.</strong> Mais deux forfaits pays
              de 5 Go sur 15 jours reviennent à 27,32 €, contre 18,25 € pour un seul forfait Monde. Le régional est rentable dès
              le deuxième pays.
            </li>
            <li>
              <strong>Le forfait Monde ne coûte quasiment pas plus cher que le forfait Europe.</strong> Si votre croisière
              mélange escales européennes et hors UE, le Monde évite de vérifier pays par pays ce que couvre la zone Europe.
            </li>
          </ul>
          <p className="note">
            Méthode : catalogue d’octobre 2026, prix en euros TTC, médiane calculée uniquement entre forfaits de même volume et
            de même durée. Les forfaits illimités sont exclus de ce tableau.
          </p>
          <ImageSuggestion alt="Prix médian d’une eSIM pays, Europe et Monde">
            graphique en barres, prix médian « un pays » contre « zone Europe » et « zone Monde » pour 5 Go / 15 jours.
          </ImageSuggestion>

          <h2 id="combien-de-data">Combien de data prévoir pour une croisière ?</h2>
          <Answer>
            Pour 2 à 4 escales hors UE avec cartes, messagerie et quelques photos, 3 Go suffisent. Prenez 5 Go si vous publiez
            des vidéos ou passez des appels vidéo, et 10 Go si vous partagez la connexion avec la famille. Choisissez une
            validité qui couvre aussi les jours de mer.
          </Answer>
          <p>
            Une escale dure rarement plus de 8 à 10 heures, dont une partie en excursion où l’on consulte peu son téléphone.
            Les besoins sont donc plus faibles que sur un séjour à terre de même durée.
          </p>
          <Table
            caption="Volume de data conseillé selon l’usage aux escales"
            head={["Votre usage aux escales", "Volume conseillé"]}
            rows={[
              ["Cartes, WhatsApp, recherche de restaurants", "3 Go"],
              ["+ photos et stories sur les réseaux sociaux", "5 Go"],
              ["+ appels vidéo, partage de connexion pour 2 ou 3 personnes", "10 Go ou illimité"],
            ]}
          />
          <p>
            <strong>Le piège de la validité.</strong> Une eSIM de 7 jours activée le jour de l’embarquement consomme aussi ses
            jours de validité pendant que le bateau est en mer. Sur une croisière de 7 nuits avec deux jours de navigation, il
            vous reste moins de 5 jours utiles. Deux solutions : activer l’eSIM à la première escale hors UE, ou choisir une
            validité de 15 jours. L’écart de prix est faible : 13,66 € contre 12,29 € en médiane pour 5 Go.
          </p>

          <h2 id="wifi-ou-esim">Wi-Fi du bateau ou eSIM : combien coûte internet sur une croisière de 7 nuits ?</h2>
          <Answer>
            Sur une croisière de 7 nuits en Méditerranée avec deux escales au Maroc, le Wi-Fi du bateau coûte environ 112 $
            par appareil, contre environ 10 € pour une eSIM Maroc utilisée aux escales. L’eSIM spéciale croisière se situe entre
            les deux et reste la seule à fonctionner en mer sans Wi-Fi.
          </Answer>
          <p>
            Prenons une croisière type au départ de Marseille : Barcelone, Palma, une journée en mer, Tanger, Casablanca, une
            deuxième journée en mer, retour à Marseille.
          </p>
          <Table
            caption="Coût d’internet sur une croisière de 7 nuits selon la solution"
            head={["Solution", "En mer", "Barcelone, Palma", "Tanger, Casablanca", "Coût pour une personne"]}
            rows={[
              ["Wi-Fi MSC « Browse » toute la croisière", "Oui", "Oui (à bord)", "Oui (à bord)", <strong key="a">7 × 16 $ = 112 $</strong>],
              ["Forfait français + eSIM Maroc 3 Go / 7 jours, mode avion en mer", "Non", "Oui", "Oui", <strong key="b">~10 €</strong>],
              ["eSIM GigSky Cruise + Europe, 1 Go / 7 jours", "Oui, si le navire est couvert", "Oui", "À vérifier", <strong key="c">27,99 $</strong>],
            ]}
          />
          <p>
            Pour un couple, multipliez le Wi-Fi par deux, ou prenez le forfait deux appareils de MSC à 45 $ par jour. L’eSIM,
            elle, s’achète par téléphone.
          </p>

          <h3>Les prix du Wi-Fi à bord en 2026</h3>
          <p>
            Les tarifs relevés par <a href={SOURCES.cruiseFever}>Cruise Fever (avril 2026)</a>, pour un appareil et par jour :
          </p>
          <Table
            caption="Prix du Wi-Fi à bord par compagnie en 2026"
            head={["Compagnie", "Forfait de base", "Forfait streaming"]}
            rows={[
              ["MSC Croisières", "16 $", "21 $"],
              ["Celebrity", "20 $", "35 $"],
              ["Princess", "24,99 $", "44,99 $"],
              ["Royal Caribbean", "~28,99 $ (prix variable)", "Non communiqué"],
              ["Norwegian", "29,99 $", "39,99 $"],
            ]}
          />
          <p>
            Nous n’avons pas trouvé de grille publique à jour pour Costa. Les prix changent selon le navire et la date, et
            l’achat avant l’embarquement, dans l’espace client de la compagnie, est souvent moins cher qu’à bord. L’application
            de la compagnie (horaires, réservations, messagerie entre passagers) fonctionne en général sur le Wi-Fi du bateau
            sans forfait payant.
          </p>

          <h3>Quand l’eSIM spéciale croisière vaut le coup</h3>
          <p>
            GigSky est le seul fournisseur grand public à vendre des forfaits qui fonctionnent sur les réseaux maritimes :
            l’entreprise annonce plus de 290 navires couverts, dont des bateaux MSC, Costa, Royal Caribbean et Princess (
            <a href={SOURCES.gigsky}>GigSky</a>). Les prix démarrent à 18,49 € selon la destination.
          </p>
          <p>Elle a du sens dans deux cas :</p>
          <ul>
            <li>
              <strong>Vous voulez rester joignable en mer sans payer le Wi-Fi de toute la croisière.</strong> Le forfait
              « Messaging + Essentials » de GigSky coûte 16,99 $ pour 3 jours. Il ne fait passer que les messages texte : pas de
              photos, pas d’appels vidéo.
            </li>
            <li>
              <strong>Votre croisière a beaucoup de jours de mer et peu d’escales.</strong> Une seule eSIM couvre le bateau et
              les ports.
            </li>
          </ul>
          <p>
            Avant d’acheter, vérifiez dans l’application GigSky que votre navire figure dans la liste : c’est le bateau qui
            compte, pas la compagnie. Notre <a href="https://mybestsim.com/en/provider/review-gigsky/">avis complet sur GigSky</a>{" "}
            détaille aussi un point de configuration (l’APN à régler à la main) qui a fait perdre un à deux jours à notre
            testeur.
          </p>

          <h2 id="installer-esim">Comment installer son eSIM avant d’embarquer ?</h2>
          <Answer>
            Installez l’eSIM chez vous ou au port de départ, en Wi-Fi, mais ne l’activez qu’à la première escale hors UE.
            Gardez votre ligne française active pour recevoir les SMS de votre banque, et réglez le téléphone pour que les
            données passent uniquement par l’eSIM.
          </Answer>
          <ol>
            <li>
              <strong>Vérifiez la compatibilité.</strong> iPhone XR, XS et modèles suivants, Google Pixel 3 et suivants, Samsung
              Galaxy S20 et suivants. Le téléphone doit être désimlocké.
            </li>
            <li>
              <strong>Installez l’eSIM avant le départ</strong>, en scannant le QR code reçu par e-mail. Le Wi-Fi du bateau
              peut suffire, mais il est souvent lent à l’embarquement.
            </li>
            <li>
              <strong>Choisissez la ligne pour les données.</strong> iPhone : <em>Réglages &gt; Données cellulaires &gt; Données
              cellulaires</em>, puis choisissez l’eSIM. Android : <em>Paramètres &gt; Gestionnaire de cartes SIM &gt; Données
              mobiles</em>.
            </li>
            <li>
              <strong>Gardez votre ligne française allumée, mais sans données.</strong> Vous recevez ainsi les SMS de validation
              bancaire (3D Secure) aux escales, utiles si vous réservez une excursion sur place. À quai hors UE, la réception de
              SMS est généralement gratuite. Vérifiez auprès de votre opérateur.
            </li>
            <li>
              <strong>Repassez en mode avion avant chaque départ du port.</strong> C’est le geste qui protège le plus votre
              facture.
            </li>
          </ol>
          <p>
            Les escales en chaloupe (<em>tender</em>), quand le bateau mouille au large comme à Santorin ou à Capri, ne
            changent rien : vous captez le réseau à terre dès l’arrivée de la navette. Téléchargez tout de même vos cartes hors
            ligne avant de descendre, les quais sont parfois mal couverts.
          </p>

          <h2 id="faq">Questions fréquentes</h2>
          {FAQ.map(({ q, a }) => (
            <section key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </section>
          ))}

          <aside className="mt-12 rounded-[16px] bg-navy-gradient px-6 py-7 text-white [&_a]:text-white [&_a]:hover:text-blue-line [&_strong]:text-white">
            <p className="my-0">
              <strong>Votre croisière passe par des escales hors UE ?</strong> Comparez plus de 100 000 forfaits sur le{" "}
              <a href={`${MBS}/`}>comparateur MyBestSim</a>, retrouvez notre classement des{" "}
              <a href={`${MBS}/meilleurs-fournisseurs-esim/`}>meilleurs fournisseurs d’eSIM</a> et les{" "}
              <a href={`${MBS}/codes-promo-cartes-esim/`}>codes promo du moment</a>.
            </p>
          </aside>

          <p className="note mt-10">
            Sources : <a href={SOURCES.jechange}>JeChange</a> (itinérance maritime, octobre 2026) ·{" "}
            <a href={SOURCES.cruiseFever}>Cruise Fever</a> (Wi-Fi à bord, avril 2026) ·{" "}
            <a href={SOURCES.cruiseCritic}>Cruise Critic</a> (Starlink) · <a href={SOURCES.gigsky}>GigSky</a> (forfaits
            croisière) · <a href={SOURCES.roamingRegulation}>Règlement (UE) 2022/612</a> (itinérance) · Analyse MyBestSim de
            5 056 forfaits eSIM (octobre 2026).
          </p>
        </article>
      </main>
    </>
  );
}

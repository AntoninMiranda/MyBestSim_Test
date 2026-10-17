# Test de recrutement MyBestSim

Test « Stagiaire Développeur IA & Automatisation », en deux parties :

| Partie | Livrable | Lien |
|---|---|---|
| 1. Data & automatisation | Dashboard qui lit les CSV fournisseurs et présente les statistiques clés | **[mybestsimtest.vercel.app](https://mybestsimtest.vercel.app)** |
| 2. Contenu SEO | Article « Internet en croisière : quelle eSIM choisir ? » | **[Version web](https://mybestsimtest.vercel.app/fr/blog/internet-en-croisiere-esim)** · [Version Markdown](docs/seo/article-internet-en-croisiere.md) · [Brief SEO](docs/seo/brief-internet-en-croisiere.md) |

# Partie 1 : dashboard catalogue eSIM

## Ce que montre le dashboard

| # | Indicateur demandé | Valeur (18 fichiers fournis) |
|---|---|---|
| 1 | Nombre total de cartes eSIM | 5 056 |
| 2 | Produits à plus de 100 € | 56 |
| 3 | Fourchette de prix | 5,36 € → 154,63 € |
| 4 | Data moyenne par carte | 14,49 Go (sur 4 403 forfaits chiffrés, 653 illimités à part) |
| 5 | Prix moyen | 29,30 € (médiane 20,70 €) |
| 6 | Répartition par fournisseur | 18 fournisseurs, d'Airalo (722) à 4S eSIM (92) |

**Bonus retenus** (3, chacun répond à une question métier) :

1. **Compétitivité prix** : qui est le moins cher ? On compare chaque produit au prix médian du marché pour le *même forfait* (même data, même durée).
2. **Grille des prix médians** (data × durée) : comment se forme le prix ?
3. **Qualité de l'import** : l'import du jour s'est-il bien passé ? Fichiers lus, lignes rejetées et motif.

On peut aussi **importer les CSV du jour** depuis le dashboard : le dashboard analyse alors uniquement les fichiers importés, et toutes les statistiques sont recalculées. Un bouton permet de revenir aux données d'exemple. Le dashboard est disponible en **français et en anglais**.

## Choix assumés

- **Forfaits illimités et moyenne de data.** 653 produits n'ont pas de `data_gb` (« Illimité »). On les exclut de la moyenne et on les compte à part. Les compter comme 0 Go donnerait 12,62 Go, ce qui est faux ; leur attribuer une valeur arbitraire (100 Go ?) serait inventé.
- **« Plus de 100 € » est pris au sens strict** (> 100 €). Le résultat est identique ici.
- **Médiane à côté de la moyenne.** Les prix sont asymétriques : quelques forfaits illimités 30 jours tirent la moyenne vers le haut.
- **Pas de prix moyen au Go par fournisseur.** C'était la première idée, mais elle est biaisée : le Go coûte plus cher sur un forfait de 1 Go que sur un de 50 Go, donc un fournisseur qui vend beaucoup de petits forfaits paraît cher. 4S eSIM serait classé le plus cher (3,59 €/Go) alors qu'il est exactement au prix du marché à forfait équivalent. Résultat de la comparaison juste : tous les fournisseurs sont à ±1,5 % du marché. Le prix dépend du forfait choisi, pas du fournisseur.
- **Pays et zones.** `EU`, `AS`, `NA`, `WW` sont des zones (Europe, Asie, Amérique du Nord, Monde), pas des pays. Attention : `NA` est lu comme une valeur manquante par pandas par défaut. Ici, tout est lu en texte et un test vérifie que les 192 produits « Amérique du Nord » sont conservés.
- **Nom du fournisseur** : pris dans la colonne `provider` (« Maya Mobile », « 4S eSIM »), pas dans le nom du fichier.
- **Robustesse aux fichiers réels.** Les 18 fichiers fournis sont propres, mais un import quotidien finira par recevoir des fichiers abîmés. On accepte le séparateur `;` et la virgule décimale (export Excel français), le BOM et les fins de ligne CRLF. Les lignes invalides (prix absent, devise autre que l'euro, SKU en double…) sont rejetées avec un motif et affichées, sans faire planter l'import. Aucune conversion de devise n'est inventée.

**Pistes écartées** pour ne pas alourdir le dashboard : part de 5G, part de forfaits rechargeables, couverture par fournisseur, fournisseur le moins cher par destination. Ce sont des descriptions du catalogue, qui n'aident pas à décider.

## Automatisation : comment brancher la vraie source

On ne sait pas comment MyBestSim reçoit ses CSV. Le dashboard sépare donc **la source des fichiers** du **calcul** : le parsing et les statistiques sont des fonctions pures, et seule la source change.

- **Aujourd'hui** : les 18 fichiers d'exemple sont lus au build, et l'équipe peut déposer les fichiers du jour dans le dashboard. Le traitement reste dans le navigateur, sans serveur ni base de données.
- **En production**, selon la façon dont les fichiers arrivent :
  - les fournisseurs déposent dans un dossier partagé (S3, Drive, FTP) → une tâche planifiée (Vercel Cron) lit le dossier chaque matin et met à jour les statistiques ;
  - les fournisseurs exposent une API ou une URL de flux → la même tâche va chercher les fichiers ;
  - un outil no-code (n8n, Make) récupère les pièces jointes → il dépose les fichiers dans le stockage, et on retombe sur le premier cas.

Ce stockage n'est pas construit volontairement : ce serait faire des hypothèses sur un système qu'on ne connaît pas.

# Partie 2 : article SEO

**Sujet imposé :** « Internet en croisière : quelle eSIM choisir ? », écrit pour MyBestSim.

## Livrables

- **[L'article en ligne](https://mybestsimtest.vercel.app/fr/blog/internet-en-croisiere-esim)** : une vraie page web, pré-rendue en HTML statique, avec ses titres, tableaux, liens et suggestions d'images.
- **[La version Markdown](docs/seo/article-internet-en-croisiere.md)**, l'un des formats demandés, à reprendre dans le CMS de MyBestSim.
- **[Le brief SEO](docs/seo/brief-internet-en-croisiere.md)** : l'analyse de la concurrence qui justifie la longueur, l'angle et le plan.

## Démarche

1. **Analyse de la concurrence avant d'écrire.** Lecture des pages qui rankent (Holafly, GoMoWorld, Roamless, Voyages Exception, Futura) : format, longueur, sections, ce qui leur manque. Méthode `content-brief` du plugin [superseo](https://github.com/inhouseseo/superseo-skills) pour Claude Code.
2. **Longueur déduite de la concurrence** : les pages en tête font ~1 500 mots et laissent des sections vides ou des prix sans source. Cible retenue : 2 000 à 2 400 mots de texte, sans remplissage.
3. **Rédaction** avec la méthode `write-content` du même plugin (réponse courte en tête de chaque section, règles contre le style « écrit par une IA »), puis vérification de chaque chiffre et de chaque lien interne.

## Choix assumés

- **Un angle honnête que les vendeurs d'eSIM évitent.** Aux escales dans l'UE, le forfait français suffit (itinérance européenne) : une eSIM n'est utile qu'hors UE. En mer, seuls le Wi-Fi du bateau ou une eSIM spéciale croisière fonctionnent. C'est ce qui différencie un comparateur d'un vendeur.
- **Des chiffres que personne d'autre n'a.** Les 5 056 forfaits des CSV de la partie 1 servent à comparer forfait pays, Europe et Monde à volume et durée identiques. Résultat inattendu : un forfait Monde coûte quasiment le même prix qu’un forfait Europe (18,25 € contre 18,24 € pour 5 Go sur 15 jours). Ces données sont celles du test ; l'article les présente comme une analyse MyBestSim, avec la méthode.
- **Tous les autres chiffres sont sourcés et datés** (JeChange pour l'itinérance maritime, Cruise Fever pour le Wi-Fi à bord, GigSky, règlement (UE) 2022/612). Aucune anecdote inventée : sans vécu de croisière, le ton est « on a analysé », pas « j'ai testé ».
- **Référencement sur les IA (GEO)** en plus de Google : titres en questions, réponse autonome de 40 à 60 mots en tête de chaque section, tableaux en HTML, données JSON-LD `Article` + `FAQPage` + `BreadcrumbList`, `robots.txt` qui autorise explicitement GPTBot, ClaudeBot, PerplexityBot et Google-Extended.
- **Images laissées en suggestions**, comme le demande la consigne : pas de photo prise sur le web (droits) ni d'image générée présentée comme une vraie capture.
- **Article en français uniquement** : `/en/blog/...` renvoie une 404 plutôt qu'une traduction automatique.

## Points remontés pour MyBestSim

- **Cannibalisation.** MyBestSim a déjà deux articles sur ce sujet (« Choisir une eSIM pour la croisière et la terre » et « Meilleure eSIM pour les bateaux de croisière 2026 »). Publier un troisième ferait se concurrencer les pages. Recommandation : en faire la page de référence et rediriger les deux anciennes vers elle (301).
- **Page Maroc supprimée.** `mybestsim.com/fr/comparaison-meilleure-carte-esim-maroc/` répond 410 alors que le Maroc est une escale fréquente des croisières en Méditerranée. L'article renvoie vers la page Monde en attendant.

# Le projet

## Architecture

Clean Architecture allégée : les dépendances vont toujours vers le domaine.

```
src/
  domain/          # règles métier pures (sans React, Next ni fs) + tests
    parse.ts       #   lecture et validation des CSV
    stats.ts       #   calcul des indicateurs
  infrastructure/  # sources de CSV : fichiers d'exemple (build) et fichiers importés (navigateur)
  i18n/            # langues, dictionnaires FR/EN
  components/      # vues (shadcn/ui) ; seul dashboard-client.tsx a un état
  app/[lang]/      # pages Next.js, une par langue, pré-rendues en statique
    blog/internet-en-croisiere-esim/  # article de la partie 2 (français uniquement)
  app/robots.ts    # robots.txt (robots de recherche et d'IA autorisés)
  proxy.ts         # redirige / vers la langue du navigateur
docs/seo/          # brief SEO et article en Markdown (partie 2)
```

On n'a pas mis de classes de use case, de repositories ni d'injection de dépendances : avec un seul cas d'usage (« calculer les stats d'un catalogue »), ce serait de la structure sans bénéfice.

Quelques choix techniques :
- **Statique et léger.** Les statistiques des fichiers d'exemple (`data/`) sont calculées au build ; le navigateur reçoit quelques Ko de résultats, pas les 5 056 lignes. Seuls les fichiers importés sont lus et analysés dans le navigateur.
- **Graphiques en HTML/CSS** (tableaux et barres) plutôt qu'avec une bibliothèque de graphiques. Ils sont présents dans le HTML statique, lisibles par les lecteurs d'écran, et les valeurs sont toujours écrites (la couleur n'est jamais la seule information).
- **Stack** : Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui, PapaParse, Vitest.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 46 tests, dont les valeurs attendues sur les 18 fichiers
npm run build
```

La CI GitHub Actions lance lint, tests, build et typecheck à chaque push.

## Ajouter une langue

1. Copier `src/i18n/dictionaries/fr.json` en `xx.json` et traduire les textes.
2. Ajouter `"xx"` dans `locales` et sa locale `Intl` dans `intlLocales` (`src/i18n/config.ts`), puis l'import dans `src/i18n/get-dictionary.ts`.

Une clé oubliée fait échouer le typecheck et le test de parité des dictionnaires.

## Utilisation de l'IA

Le projet a été construit avec Claude Code, qui a servi d'assistant.

Pour la partie 1 :
- **Analyse des données** : profilage des 18 fichiers (doublons, devises, valeurs vides, codes pays) pour repérer les vrais pièges (illimités, `NA`) avant d'écrire du code.
- **Remise en question des idées** : le prix moyen au Go par fournisseur a été vérifié sur les données avant d'être retenu, ce qui a révélé le biais et mené à l'indice à forfait équivalent.
- **Conception** : discussion du besoin métier, de l'architecture et de la façon de recevoir les CSV, avec les décisions prises par moi à chaque étape.
- **Développement guidé par les tests** : les valeurs attendues ont été calculées d'abord, puis servies d'oracle aux tests.
- **Vérification** : lecture de la documentation de Next.js 16 fournie avec le paquet (les conventions ont changé), puis contrôle du rendu dans un navigateur (desktop, mobile, FR/EN, import de fichiers piégés).

Pour la partie 2 :
- **Recherche** : lecture des pages concurrentes, des tarifs des opérateurs et des compagnies, avec le plugin superseo qui impose une méthode (brief, lacunes, plan) au lieu d'un article générique.
- **Données originales** : les CSV de la partie 1 réutilisés pour comparer forfaits pays et régionaux.
- **Vérification** : chaque chiffre recoupé avec sa source, chaque lien interne testé, les chiffres contradictoires écartés ou présentés comme indicatifs.
- **Décisions humaines** : format (page web), pas de vécu inventé, CSV en appui, ajout du référencement sur les IA, images laissées en suggestions.

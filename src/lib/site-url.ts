// URL publique pour les métadonnées, le JSON-LD et robots.txt ; Vercel fournit le domaine de production.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

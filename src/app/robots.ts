import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Robots des moteurs IA autorisés explicitement : l'article de blog vise aussi à être cité par ChatGPT, Claude, Perplexity et Gemini.
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    host: siteUrl,
  };
}

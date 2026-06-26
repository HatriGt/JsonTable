import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSiteUrl } from "@/lib/site";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Bump when site content/structure changes meaningfully so crawlers reschedule.
const LAST_MODIFIED = "2026-06-26";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Always emit the canonical host (www), regardless of which host served
        // this request, so the sitemap can't disagree with the canonical tags.
        const origin = getSiteUrl();
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/workspace", changefreq: "weekly", priority: "0.8" },
          { path: "/json-viewer", changefreq: "monthly", priority: "0.7" },
          { path: "/json-formatter", changefreq: "monthly", priority: "0.7" },
          { path: "/json-to-table", changefreq: "monthly", priority: "0.7" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${origin}${e.path}</loc>`,
            `    <lastmod>${LAST_MODIFIED}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

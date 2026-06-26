// Production origin — must match the host the deployment actually serves on.
// Vercel's primary domain is www (apex 308-redirects to www), so canonical/OG/
// sitemap URLs use www; pointing them at the apex contradicts that redirect and
// makes Google ignore the canonical tag. Overridable via VITE_SITE_URL.
const DEFAULT_SITE_URL = "https://www.jsontable.xyz";

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_SITE_URL;
}

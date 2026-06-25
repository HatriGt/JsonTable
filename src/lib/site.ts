// Production origin. Used to make canonical/OG/Twitter URLs absolute even when
// the build doesn't set VITE_SITE_URL (e.g. Vercel without the env var) — a
// localhost fallback here silently poisons canonical tags in production.
const DEFAULT_SITE_URL = "https://jsontable.xyz";

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_SITE_URL;
}

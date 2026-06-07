const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_SITE_URL;
}

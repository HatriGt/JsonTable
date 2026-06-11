export function LandingFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-auto border-t border-border/60 py-6 text-center text-xs text-muted-foreground sm:py-8"
    >
      © {new Date().getFullYear()} JSON‑Table · Built for developers
    </footer>
  );
}

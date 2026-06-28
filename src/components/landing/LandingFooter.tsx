const YEAR = new Date().getFullYear();

const TOOL_LINKS = [
  { href: "/json-viewer", label: "JSON Viewer" },
  { href: "/json-formatter", label: "JSON Formatter" },
  { href: "/json-to-table", label: "JSON to Table" },
  { href: "/json-diff", label: "JSON Diff" },
  { href: "/workspace", label: "Workspace" },
];

export function LandingFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-auto border-t border-border/60 py-8 text-center text-xs text-muted-foreground"
    >
      <nav aria-label="JSON tools" className="mb-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4">
          {TOOL_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      © {YEAR} JSON‑Table · Built for developers
    </footer>
  );
}

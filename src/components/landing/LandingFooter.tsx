import { Link } from "@tanstack/react-router";

const YEAR = new Date().getFullYear();

const TOOL_LINKS = [
  { href: "/json-viewer", label: "JSON Viewer & Formatter" },
  { href: "/json-to-table", label: "JSON to Table" },
  { href: "/json-diff", label: "JSON Diff" },
  { href: "/workspace", label: "Workspace" },
  { href: "/guides", label: "Guides" },
];

export function LandingFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-auto border-t border-border/40 bg-background/60 py-8 text-center text-xs text-muted-foreground backdrop-blur-md"
    >
      <nav aria-label="JSON tools" className="mb-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4">
          {TOOL_LINKS.map((link) => (
            <li key={link.href}>
              <Link to={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      © {YEAR} JSON‑Table · Built for developers
    </footer>
  );
}

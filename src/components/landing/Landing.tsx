import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LandingHero } from "./LandingHero";
import { LandingThemeToggle } from "./LandingThemeToggle";
import { PasteDialog } from "@/components/input/PasteDialog";

export function Landing() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);

  return (
    <div className="landing-page relative min-h-dvh text-foreground">
      <LandingThemeToggle />
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="landing-grid-layer-headline pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[oklch(0.55_0.19_258)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <main id="main-content" className="relative">
        <LandingHero onOpenPasteDialog={() => setPasteOpen(true)} />
      </main>
      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onBeforeLoad={() => navigate({ to: "/workspace" })}
      />
    </div>
  );
}

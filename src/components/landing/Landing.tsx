import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LandingNav } from "./LandingNav";
import { LandingHero } from "./LandingHero";
import { LandingFeatures } from "./LandingFeatures";
import { LandingFooter } from "./LandingFooter";
import { PasteDialog } from "@/components/input/PasteDialog";

export function Landing() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);

  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />
      <main id="main-content" className="relative flex-1">
        <LandingHero onOpenPasteDialog={() => setPasteOpen(true)} />
        <LandingFeatures />
      </main>
      <LandingFooter />
      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onBeforeLoad={() => navigate({ to: "/workspace" })}
      />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LandingNav } from "./LandingNav";
import { LandingBackdrop } from "./LandingBackdrop";
import { LandingDots } from "./LandingDots";
import { LandingHero } from "./LandingHero";
import { LandingDemo } from "./LandingDemo";
import { LandingFeatures } from "./LandingFeatures";
import { LandingTools } from "./LandingTools";
import { LandingFaq } from "./LandingFaq";
import { LandingFooter } from "./LandingFooter";
import { PasteDialog } from "@/components/input/PasteDialog";

export function Landing() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);

  return (
    <div className="landing-page landing-page--scenic relative flex min-h-dvh flex-col text-foreground">
      <LandingBackdrop />
      <LandingDots />
      <LandingNav />
      <main id="main-content" className="relative flex-1">
        <LandingHero onOpenPasteDialog={() => setPasteOpen(true)} />
        <LandingDemo />
        <LandingTools />
        <LandingFeatures />
        <LandingFaq />
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

import { useEffect, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { parseJsonAsync } from "@/lib/json/parse";
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
  const router = useRouter();
  const [pasteOpen, setPasteOpen] = useState(false);

  // The CTAs navigate via buttons, so the router never preloads /workspace on
  // intent — the first click then cold-loads the lazy chunk (a visible flash).
  // Warm the route chunk and the parse worker on mount so the first open is as
  // instant as later ones.
  useEffect(() => {
    void router.preloadRoute({ to: "/workspace" });
    void parseJsonAsync("0");
  }, [router]);

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

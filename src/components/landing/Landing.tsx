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

  // Play the entrance animation only once fonts are ready, so the headline
  // doesn't swap font mid-animation (which looks janky). Fallback timer ensures
  // it always runs even if the Font Loading API is unavailable or slow.
  useEffect(() => {
    const root = document.documentElement;
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      root.classList.add("landing-ready");
    };
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    void (fonts?.ready ?? Promise.resolve()).then(reveal);
    const timer = window.setTimeout(reveal, 700);
    return () => window.clearTimeout(timer);
  }, []);

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

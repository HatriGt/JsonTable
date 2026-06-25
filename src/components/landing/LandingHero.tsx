import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ClipboardPaste, Sparkles } from "lucide-react";
import { PreviewMock } from "./PreviewMock";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "@/lib/motion/framer";

type Props = {
  onOpenPasteDialog: () => void;
};

const tiltSpring = { stiffness: 150, damping: 18, mass: 0.4 };

/** Subtle cursor-tracking 3D tilt. Off on touch / reduced-motion. */
function PreviewTilt({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [enabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), tiltSpring);

  if (reduced || !enabled) return <>{children}</>;

  return (
    <m.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="will-change-transform [transform-style:preserve-3d]"
    >
      {children}
    </m.div>
  );
}

export function LandingHero({ onOpenPasteDialog }: Props) {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);

  const pasteAndOpen = useCallback(() => {
    void pasteFromClipboard({
      loadJson,
      onOpenDialog: onOpenPasteDialog,
      onStart: () => navigate({ to: "/workspace" }),
    });
  }, [loadJson, navigate, onOpenPasteDialog]);

  // Load the sample into the store first, then navigate, so the workspace mounts
  // with the document already present (no empty-state flash during the route
  // transition).
  const openSample = useCallback(async () => {
    await loadJson("sample.json", SAMPLE_JSON);
    navigate({ to: "/workspace" });
  }, [loadJson, navigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = e.key.toLowerCase();
      const isPasteShortcut = (e.metaKey || e.ctrlKey) && (key === "v" || key === "p");
      if (!isPasteShortcut) return;
      e.preventDefault();
      pasteAndOpen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pasteAndOpen]);

  return (
    <section className="relative overflow-hidden">
      <div
        className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:pb-8 lg:pt-20">
        {/* Left: copy, orchestrated stagger */}
        <Stagger className="text-center lg:text-left">
          <StaggerItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Local-first JSON viewer
            </p>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-5 text-balance text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.5rem]">
              Read JSON like a <span className="font-mono font-medium text-brand">spreadsheet</span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mx-auto mt-5 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
              Nested payloads become a navigable tree and a filterable grid. Find any value in
              seconds, not scroll-minutes.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <Button
                size="lg"
                className="h-11 cursor-pointer gap-2 px-5 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                onClick={pasteAndOpen}
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste JSON
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 cursor-pointer gap-2 px-5 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                onClick={() => void openSample()}
              >
                <Sparkles className="h-4 w-4 text-brand" />
                Try a sample
              </Button>
            </div>
          </StaggerItem>
        </Stagger>

        {/* Right: real component preview with subtle tilt */}
        <Stagger className="relative w-full">
          <StaggerItem>
            <PreviewTilt>
              <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-landing-demo">
                <PreviewMock />
              </div>
            </PreviewTilt>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

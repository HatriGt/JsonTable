import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useOpenSampleWorkspace } from "@/lib/workspace/use-open-sample";
import { LandingThemeToggle } from "./LandingThemeToggle";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const openSample = useOpenSampleWorkspace();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-[var(--motion-duration-normal)] ${
        scrolled ? "border-border bg-background" : "border-transparent bg-background"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex cursor-pointer items-center gap-2.5">
          <BrandLogo className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href="/#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Features
          </a>
          <LandingThemeToggle />
          <Button
            size="sm"
            onClick={() => void openSample()}
            className="cursor-pointer gap-1.5 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Open workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}

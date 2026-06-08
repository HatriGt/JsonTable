import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-[var(--motion-duration-normal)] ${
        scrolled
          ? "border-border bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md"
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/12 text-brand transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        <Button asChild size="sm" className="cursor-pointer gap-1.5">
          <Link to="/workspace">
            Open workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

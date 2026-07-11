import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { getSiteUrl } from "@/lib/site";
import { registerServiceWorker } from "@/lib/pwa/register-sw";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-primary/90 active:scale-[0.98]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-destructive">Error</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-primary/90 active:scale-[0.98]"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-accent active:scale-[0.98]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0f1a" },
      { title: "JSON\u2011Table" },
      {
        name: "description",
        content:
          "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet. Local\u2011first, fast, free.",
      },
      { property: "og:title", content: "JSON\u2011Table" },
      {
        property: "og:description",
        content: "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${getSiteUrl()}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "JSON‑Table — the fastest way to read JSON, shown as a tree and a grid.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "JSON\u2011Table" },
      {
        name: "twitter:description",
        content: "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
      },
      { name: "twitter:image", content: `${getSiteUrl()}/og.png` },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        children:
          "try{var p=localStorage.getItem('json-table:prefs:v1');var t=p?JSON.parse(p).theme:'light';if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Without JS the readiness class is never added, so reveal the
            entrance-animated content immediately. */}
        <noscript>
          <style>{".rise-in{opacity:1}"}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Register the offline service worker and surface connectivity changes.
  useEffect(() => {
    registerServiceWorker();
    const onOffline = () =>
      toast.info("You're offline", {
        description: "JSON‑Table keeps working — your data stays in this browser.",
      });
    const onOnline = () => toast.success("Back online");
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>
        <PageTransition>
          <Outlet />
        </PageTransition>
        <Toaster richColors position="bottom-right" closeButton />
      </MotionProvider>
    </QueryClientProvider>
  );
}

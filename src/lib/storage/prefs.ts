export type ThemePref = "dark" | "light";
const KEY = "json-table:prefs:v1";

export type LeftPaneTab = "tree" | "source";

export const GRID_ZOOM_MIN = 50;
export const GRID_ZOOM_MAX = 200;
export const GRID_ZOOM_STEP = 5;
export const GRID_ZOOM_DEFAULT = 100;

export type Prefs = {
  theme: ThemePref;
  panels: [number, number];
  leftPaneTab: LeftPaneTab;
  gridZoom: number;
  /** One-time consent to upload large JSON for server-backed short links. */
  shareUploadConsent: boolean;
};

const DEFAULTS: Prefs = {
  theme: "light",
  panels: [30, 70],
  leftPaneTab: "source",
  gridZoom: GRID_ZOOM_DEFAULT,
  shareUploadConsent: false,
};

function migrateGridZoom(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return GRID_ZOOM_DEFAULT;
  const stepped = Math.round(n / GRID_ZOOM_STEP) * GRID_ZOOM_STEP;
  return Math.min(GRID_ZOOM_MAX, Math.max(GRID_ZOOM_MIN, stepped));
}

function migratePanels(panels: unknown): [number, number] {
  if (!Array.isArray(panels) || panels.length < 2) return DEFAULTS.panels;
  const left = Number(panels[0]);
  const grid = Number(panels[1]);
  if (!Number.isFinite(left) || !Number.isFinite(grid) || left <= 0 || grid <= 0) {
    return DEFAULTS.panels;
  }
  const total = left + grid;
  if (total <= 0) return DEFAULTS.panels;
  return [(left / total) * 100, (grid / total) * 100];
}

function migrateTheme(theme: unknown): ThemePref {
  if (theme === "dark" || theme === "light") return theme;
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return DEFAULTS.theme;
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs & { inspectorOpen?: boolean }>;
    return {
      theme: migrateTheme(parsed.theme),
      leftPaneTab: parsed.leftPaneTab ?? DEFAULTS.leftPaneTab,
      panels: migratePanels(parsed.panels),
      gridZoom: migrateGridZoom(parsed.gridZoom),
      shareUploadConsent: parsed.shareUploadConsent ?? DEFAULTS.shareUploadConsent,
    };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(p: Partial<Prefs>) {
  if (typeof window === "undefined") return;
  const cur = loadPrefs();
  const next = { ...cur, ...p };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export type ThemeOrigin = { x: number; y: number };

let themeSwitchFrame = 0;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

/** Instant swap — blocks inherited color transitions on bulk DOM (grid, source). */
function swapThemeClass(theme: ThemePref) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");
  cancelAnimationFrame(themeSwitchFrame);
  themeSwitchFrame = requestAnimationFrame(() => {
    themeSwitchFrame = requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

function setRevealOrigin(origin: ThemeOrigin) {
  const root = document.documentElement;
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  root.style.setProperty("--theme-reveal-x", `${origin.x}px`);
  root.style.setProperty("--theme-reveal-y", `${origin.y}px`);
  root.style.setProperty("--theme-reveal-radius", `${radius}px`);
}

function clearRevealOrigin() {
  const root = document.documentElement;
  root.style.removeProperty("--theme-reveal-x");
  root.style.removeProperty("--theme-reveal-y");
  root.style.removeProperty("--theme-reveal-radius");
}

function applyWithViewTransition(theme: ThemePref, origin: ThemeOrigin) {
  const root = document.documentElement;
  setRevealOrigin(origin);
  root.classList.add("theme-transition-active");

  const transition = document.startViewTransition(() => {
    swapThemeClass(theme);
  });

  void transition.finished.finally(() => {
    root.classList.remove("theme-transition-active");
    clearRevealOrigin();
  });
}

/** Overlay crossfade for browsers without View Transitions API. */
function applyWithShellFade(theme: ThemePref) {
  const overlay = document.createElement("div");
  overlay.className = "theme-fade-overlay";
  overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  swapThemeClass(theme);

  requestAnimationFrame(() => {
    overlay.classList.add("theme-fade-overlay--out");
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true },
    );
    // Safety net if transitionend doesn't fire
    window.setTimeout(() => overlay.remove(), 400);
  });
}

/**
 * Apply theme with optional animated transition from a click origin.
 * Skips animation on init (no origin) and when prefers-reduced-motion is set.
 */
export function applyTheme(theme: ThemePref, origin?: ThemeOrigin) {
  if (typeof document === "undefined") return;

  if (!origin || prefersReducedMotion()) {
    swapThemeClass(theme);
    return;
  }

  if (supportsViewTransitions()) {
    applyWithViewTransition(theme, origin);
    return;
  }

  applyWithShellFade(theme);
}

import { startTransition } from "react";
import { create } from "zustand";
import {
  applyTheme,
  loadPrefs,
  savePrefs,
  type ThemeOrigin,
  type ThemePref,
} from "@/lib/storage/prefs";

type State = {
  theme: ThemePref;
  setTheme: (t: ThemePref, origin?: ThemeOrigin) => void;
  init: () => void;
};

export const useTheme = create<State>((set) => ({
  theme: "dark",
  setTheme: (t, origin) => {
    savePrefs({ theme: t });
    applyTheme(t, origin);
    startTransition(() => {
      set({ theme: t });
    });
  },
  init: () => {
    const p = loadPrefs();
    applyTheme(p.theme);
    set({ theme: p.theme });
  },
}));

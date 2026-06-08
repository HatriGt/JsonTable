import { create } from "zustand";
import { applyTheme, loadPrefs, savePrefs, type ThemePref } from "@/lib/storage/prefs";

type State = {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  init: () => void;
};

export const useTheme = create<State>((set) => ({
  theme: "dark",
  setTheme: (t) => {
    savePrefs({ theme: t });
    applyTheme(t);
    set({ theme: t });
  },
  init: () => {
    const p = loadPrefs();
    applyTheme(p.theme);
    set({ theme: p.theme });
  },
}));

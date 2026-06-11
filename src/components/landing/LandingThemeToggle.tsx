import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";

export function LandingThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const init = useTheme((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const ThemeIcon = theme === "dark" ? Moon : Sun;
  const label = theme === "dark" ? "Dark" : "Light";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={(e) => setTheme(nextTheme, { x: e.clientX, y: e.clientY })}
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}. Click to switch.`}
    >
      <ThemeIcon className="h-4 w-4" />
    </Button>
  );
}

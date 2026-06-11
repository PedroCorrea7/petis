import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/lib/petis-storage";

export function DarkModeToggle() {
  const { dark, toggle } = useDarkMode();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={dark}
      className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

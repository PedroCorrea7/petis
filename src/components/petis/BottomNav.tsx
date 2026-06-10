import { Home, CalendarDays, Syringe, Dog } from "lucide-react";
import type { ComponentType } from "react";

export type TabKey = "home" | "agenda" | "vaccines" | "profile";

const TABS: { key: TabKey; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Início", Icon: Home },
  { key: "agenda", label: "Agenda", Icon: CalendarDays },
  { key: "vaccines", label: "Vacinas", Icon: Syringe },
  { key: "profile", label: "Perfil", Icon: Dog },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={
                  "flex min-h-14 w-full flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")
                }
              >
                <span
                  className={
                    "grid h-9 w-9 place-items-center rounded-2xl transition-colors " +
                    (isActive ? "bg-secondary" : "bg-transparent")
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

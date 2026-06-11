import { Home, CalendarDays, Syringe, Dog } from "lucide-react";
import type { ComponentType } from "react";
import { toast } from "sonner";

export type TabKey = "home" | "agenda" | "vaccines" | "profile";

const TABS: {
  key: TabKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  requiresPet?: boolean;
}[] = [
  { key: "home", label: "Início", Icon: Home },
  { key: "agenda", label: "Agenda", Icon: CalendarDays, requiresPet: true },
  { key: "vaccines", label: "Vacinas", Icon: Syringe, requiresPet: true },
  { key: "profile", label: "Perfil", Icon: Dog },
];

export function BottomNav({
  active,
  onChange,
  hasPet,
  onLockedTabClick,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  hasPet: boolean;
  onLockedTabClick?: () => void;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ key, label, Icon, requiresPet }) => {
          const isActive = key === active;
          const isLocked = !!requiresPet && !hasPet;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  if (isLocked) {
                    toast.error("Cadastre um pet primeiro para liberar esta função", {
                      description: "Vamos te levar à tela de cadastro.",
                    });
                    onLockedTabClick?.();
                    return;
                  }
                  onChange(key);
                }}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                aria-disabled={isLocked}
                className={
                  "flex min-h-14 w-full flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (isLocked
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground")
                }
              >
                <span
                  className={
                    "grid h-9 w-9 place-items-center rounded-2xl transition-colors " +
                    (isActive && !isLocked ? "bg-secondary" : "bg-transparent")
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

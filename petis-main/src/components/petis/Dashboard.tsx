import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus, Syringe, CalendarPlus, Scale, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePetis } from "@/lib/petis-storage";
import { PetAvatar } from "./PetAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TabKey } from "./BottomNav";

export function Dashboard({
  onQuickAction,
}: {
  onQuickAction: (action: "vaccine" | "appointment" | "weight") => void;
  onNavigate?: (k: TabKey) => void;
}) {
  const { data, activePet, toggleTask } = usePetis();
  const [celebrate, setCelebrate] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = useMemo(
    () =>
      data.tasks.filter(
        (t) => t.petId === activePet?.id && t.date === todayStr,
      ),
    [data.tasks, activePet, todayStr],
  );
  const done = todayTasks.filter((t) => t.completed).length;
  const total = todayTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleTask(id);
    if (!currentlyCompleted) {
      setCelebrate(id);
      toast.success("Tarefa concluída!", { description: "Bom cuidado com seu pet 🐾" });
      setTimeout(() => setCelebrate(null), 600);
    }
  };

  return (
    <div className="space-y-5 p-5 pb-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <PetAvatar pet={activePet} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">Olá, tutor</p>
          <h1 className="truncate text-xl font-bold tracking-tight">
            {activePet ? `do ${activePet.name}! 🐾` : "do seu pet! 🐾"}
          </h1>
        </div>
      </header>

      {/* Daily summary */}
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm opacity-90">Resumo do dia</p>
            <p className="mt-1 text-2xl font-bold">
              {done} de {total} cuidados
            </p>
            <p className="text-sm opacity-90">
              {pct === 100 && total > 0
                ? "Tudo em dia! ✨"
                : "Continue cuidando bem do seu pet."}
            </p>
          </div>
          <Sparkles className="h-8 w-8 shrink-0 opacity-80" aria-hidden />
        </div>
        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-primary-foreground/20"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso dos cuidados de hoje"
        >
          <div
            className="h-full rounded-full bg-primary-foreground transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="mb-2 text-sm font-semibold text-muted-foreground">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            label="Vacina"
            icon={<Syringe className="h-5 w-5" />}
            onClick={() => onQuickAction("vaccine")}
          />
          <QuickAction
            label="Compromisso"
            icon={<CalendarPlus className="h-5 w-5" />}
            onClick={() => onQuickAction("appointment")}
          />
          <QuickAction
            label="Peso"
            icon={<Scale className="h-5 w-5" />}
            onClick={() => onQuickAction("weight")}
          />
        </div>
      </section>

      {/* Today's reminders */}
      <section aria-labelledby="reminders-title">
        <h2 id="reminders-title" className="mb-2 text-sm font-semibold text-muted-foreground">
          Lembretes de hoje
        </h2>
        {todayTasks.length === 0 ? (
          <Card className="rounded-2xl p-5 text-center text-sm text-muted-foreground">
            Nenhum lembrete para hoje. Aproveite o dia! 🌿
          </Card>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleToggle(t.id, t.completed)}
                  aria-pressed={t.completed}
                  className={
                    "flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (t.completed
                      ? "border-success/30 bg-success/5"
                      : "border-border hover:border-primary/40")
                  }
                >
                  <span
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full " +
                      (t.completed ? "text-success" : "text-muted-foreground") +
                      (celebrate === t.id ? " animate-pop-check" : "")
                    }
                  >
                    {t.completed ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <Circle className="h-7 w-7" />
                    )}
                  </span>
                  <span
                    className={
                      "flex-1 text-base font-medium " +
                      (t.completed ? "text-muted-foreground line-through" : "text-foreground")
                    }
                  >
                    {t.title}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (t.completed
                        ? "bg-success/15 text-success"
                        : "bg-warning/20 text-warning-foreground")
                    }
                  >
                    {t.completed ? "Concluído" : "Pendente"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className="flex h-auto min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-border bg-card p-3 text-foreground hover:bg-secondary"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
        {icon}
      </span>
      <span className="flex items-center gap-1 text-xs font-semibold">
        <Plus className="h-3 w-3" />
        {label}
      </span>
    </Button>
  );
}

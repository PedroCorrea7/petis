
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Syringe,
  CalendarPlus,
  Scale,
  Sparkles,
  PawPrint,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { usePetis } from "@/lib/petis-storage";
import { PetAvatar } from "./PetAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TabKey } from "./BottomNav";
import { t, useLanguage } from "@/lib/i18n";

export function Dashboard({
  onQuickAction,
  onAddPet,
}: {
  onQuickAction: (action: "vaccine" | "appointment" | "weight") => void;
  onNavigate?: (k: TabKey) => void;
  onAddPet: () => void;
}) {
  useLanguage(); // Ensure component re-renders when language changes
  const { data, activePet, toggleTask, addTask } = usePetis();
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [openReminder, setOpenReminder] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayTasks = useMemo(() => {
    if (!activePet) return [];
    const items = data.tasks
      .filter((t) => t.petId === activePet.id)
      .filter((t) => t.recurring === "daily" || t.date === todayStr)
      .map((t) => ({
        ...t,
        completedToday:
          t.recurring === "daily"
            ? (t.completedDates ?? []).includes(todayStr)
            : t.completed,
      }))
      .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
    return items;
  }, [data.tasks, activePet, todayStr]);

  // Zero state — no pets at all
  if (data.pets.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-5 p-6 pb-10 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-secondary text-5xl shadow-sm animate-pulse-soft">
          🐾
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("welcome.to.petis")}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t("welcome.start")}
          </p>
        </div>
        <Button
          type="button"
          onClick={onAddPet}
          className="min-h-12 w-full max-w-xs rounded-2xl text-base font-semibold shadow-md"
        >
          <PawPrint className="h-5 w-5" /> + {t("add.pet")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t("local.storage.notice")}
        </p>
      </div>
    );
  }

  const done = todayTasks.filter((t) => t.completedToday).length;
  const total = todayTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleTask(id, todayStr);
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
          <p className="text-sm text-muted-foreground">{t("hello.owner")}</p>
          <h1 className="truncate text-xl font-bold tracking-tight">
            {activePet ? `${activePet.name}! 🐾` : "do seu pet! 🐾"}
          </h1>
        </div>
      </header>

      {/* Daily summary */}
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm opacity-90">{t("daily.summary")}</p>
            <p className="mt-1 text-2xl font-bold">
              {t("care.summary", done, total)}
            </p>
            <p className="text-sm opacity-90">
              {total === 0
                ? t("add.reminder.to.start")
                : pct === 100
                  ? t("all.good")
                  : t("keep.it.up")}
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
          {t("quick.actions")}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            label={t("vaccine")}
            icon={<Syringe className="h-5 w-5" />}
            onClick={() => onQuickAction("vaccine")}
          />
          <QuickAction
            label={t("appointment")}
            icon={<CalendarPlus className="h-5 w-5" />}
            onClick={() => onQuickAction("appointment")}
          />
          <QuickAction
            label={t("weight")}
            icon={<Scale className="h-5 w-5" />}
            onClick={() => onQuickAction("weight")}
          />
        </div>
      </section>

      {/* Today's reminders */}
      <section aria-labelledby="reminders-title">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="reminders-title" className="text-sm font-semibold text-muted-foreground">
            {t("todays.reminders")}
          </h2>
          <button
            type="button"
            onClick={() => setOpenReminder(true)}
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent/15 px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Adicionar novo lembrete"
          >
            <Plus className="h-3.5 w-3.5" /> {t("new.reminder")}
          </button>
        </div>
        {todayTasks.length === 0 ? (
          <Card className="rounded-2xl p-5 text-center text-sm text-muted-foreground">
            {t("no.reminders.today")}{" "}
            <span className="font-semibold text-accent">
              {t("add.new.reminder.prompt")}
            </span>
          </Card>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleToggle(t.id, t.completedToday)}
                  aria-pressed={t.completedToday}
                  className={
                    "flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (t.completedToday
                      ? "border-success/30 bg-success/5"
                      : "border-border hover:border-primary/40")
                  }
                >
                  <span
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full " +
                      (t.completedToday ? "text-success" : "text-muted-foreground") +
                      (celebrate === t.id ? " animate-pop-check" : "")
                    }
                  >
                    {t.completedToday ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <Circle className="h-7 w-7" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={
                        "truncate text-base font-medium " +
                        (t.completedToday
                          ? "text-muted-foreground line-through"
                          : "text-foreground")
                      }
                    >
                      {t.title}
                    </span>
                    {(t.time || t.recurring === "daily") && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {t.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.time}
                          </span>
                        )}
                        {t.recurring === "daily" && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                            Diário
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (t.completedToday
                        ? "bg-success/15 text-success"
                        : "bg-warning/20 text-warning-foreground")
                    }
                  >
                    {t.completedToday ? "Concluído" : "Pendente"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReminderDialog
        open={openReminder}
        onOpenChange={setOpenReminder}
        onSubmit={({ title, time, recurring }) => {
          if (!activePet) return;
          addTask({
            petId: activePet.id,
            title,
            date: todayStr,
            time: time || undefined,
            recurring,
          });
          toast.success("Lembrete adicionado!", {
            description: recurring === "daily" ? "Vai se repetir todos os dias." : "Para hoje.",
          });
          setOpenReminder(false);
        }}
      />
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

function ReminderDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: { title: string; time: string; recurring: "once" | "daily" }) => void;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [recurring, setRecurring] = useState<"once" | "daily">("once");
  const [touched, setTouched] = useState(false);
  const titleErr = !title.trim() ? "Informe o nome da atividade" : "";

  const reset = () => {
    setTitle("");
    setTime("");
    setRecurring("once");
    setTouched(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("new.reminder.dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("new.reminder.dialog.description")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (titleErr) return;
            onSubmit({ title: title.trim(), time, recurring });
          }}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="r-title">{t("activity.label")}</Label>
            <Input
              id="r-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("activity.placeholder")}
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!titleErr}
              autoFocus
            />
            {touched && titleErr && <p className="text-xs text-destructive">{titleErr}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-time">{t("time.label")}</Label>
              <Input
                id="r-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="min-h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-rec">{t("repetition.label")}</Label>
              <Select value={recurring} onValueChange={(v) => setRecurring(v as "once" | "daily")}>
                <SelectTrigger id="r-rec" className="min-h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">{t("repetition.once")}</SelectItem>
                  <SelectItem value="daily">{t("repetition.daily")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button type="submit" className="min-h-11 rounded-xl">
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

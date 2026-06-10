import { useMemo, useState } from "react";
import { Plus, Trash2, Clock, CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { toast } from "sonner";
import { usePetis, type Appointment } from "@/lib/petis-storage";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "./ConfirmDialog";

type Filter = "all" | "pending" | "done" | "late";

const TYPES: Appointment["type"][] = [
  "Banho/Tosa",
  "Consulta",
  "Vacina",
  "Medicação",
  "Passeio",
];

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function Agenda({
  openForm,
  setOpenForm,
}: {
  openForm: boolean;
  setOpenForm: (o: boolean) => void;
}) {
  const { data, activePet, addAppointment, toggleAppointment, deleteAppointment } = usePetis();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const s = startOfWeek();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, []);

  const todayIso = new Date().toISOString().slice(0, 10);

  const list = useMemo(() => {
    const items = data.appointments
      .filter((a) => a.petId === activePet?.id)
      .map((a) => {
        const isLate = !a.completed && a.date < todayIso;
        const status: "done" | "late" | "pending" = a.completed
          ? "done"
          : isLate
            ? "late"
            : "pending";
        return { ...a, status };
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [data.appointments, activePet, filter, todayIso]);

  return (
    <div className="space-y-5 p-5 pb-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            {activePet ? `Compromissos de ${activePet.name}` : "Selecione um pet"}
          </p>
        </div>
        <Button
          onClick={() => setOpenForm(true)}
          className="min-h-11 rounded-2xl"
          aria-label="Adicionar novo compromisso"
        >
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </header>

      {/* Week strip */}
      <Card className="rounded-3xl p-3">
        <ul className="flex justify-between gap-1" role="tablist" aria-label="Dias da semana">
          {weekDays.map((d) => {
            const iso = d.toISOString().slice(0, 10);
            const isSelected = iso === selectedDay;
            const isToday = iso === todayIso;
            const hasItems = data.appointments.some(
              (a) => a.petId === activePet?.id && a.date === iso,
            );
            return (
              <li key={iso} className="flex-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={d.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  onClick={() => setSelectedDay(iso)}
                  className={
                    "flex min-h-14 w-full flex-col items-center justify-center rounded-2xl py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/60")
                  }
                >
                  <span className="uppercase tracking-wide">
                    {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                  </span>
                  <span className="mt-0.5 text-base font-bold">{d.getDate()}</span>
                  {hasItems && (
                    <span
                      className={
                        "mt-1 h-1.5 w-1.5 rounded-full " +
                        (isSelected ? "bg-primary-foreground" : "bg-accent")
                      }
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtros">
        {(
          [
            { k: "all", label: "Todas" },
            { k: "pending", label: "Pendentes" },
            { k: "done", label: "Concluídas" },
            { k: "late", label: "Atrasadas" },
          ] as { k: Filter; label: string }[]
        ).map((f) => (
          <button
            key={f.k}
            type="button"
            role="tab"
            aria-selected={filter === f.k}
            onClick={() => setFilter(f.k)}
            className={
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (filter === f.k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <section aria-label="Lista de compromissos" className="space-y-2">
        {list.length === 0 ? (
          <Card className="rounded-2xl p-6 text-center text-sm text-muted-foreground">
            Nenhum compromisso aqui ainda.
          </Card>
        ) : (
          list.map((a) => <AppointmentCard
            key={a.id}
            a={a}
            onToggle={() => {
              toggleAppointment(a.id);
              if (!a.completed) toast.success("Compromisso concluído!");
            }}
            onDelete={() => setPendingDelete(a.id)}
          />)
        )}
      </section>

      <AppointmentForm
        open={openForm}
        onOpenChange={setOpenForm}
        defaultDate={selectedDay}
        onSubmit={(values) => {
          if (!activePet) {
            toast.error("Cadastre um pet primeiro.");
            return;
          }
          addAppointment({ ...values, petId: activePet.id });
          toast.success("Compromisso agendado!");
          setOpenForm(false);
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Remover compromisso?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        destructive
        onConfirm={() => {
          if (pendingDelete) {
            deleteAppointment(pendingDelete);
            toast.success("Compromisso removido.");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function AppointmentCard({
  a,
  onToggle,
  onDelete,
}: {
  a: Appointment & { status: "pending" | "done" | "late" };
  onToggle: () => void;
  onDelete: () => void;
}) {
  const StatusIcon =
    a.status === "done" ? CheckCircle2 : a.status === "late" ? AlertTriangle : Clock;
  const statusColor =
    a.status === "done"
      ? "text-success bg-success/15"
      : a.status === "late"
        ? "text-destructive bg-destructive/15"
        : "text-warning-foreground bg-warning/20";
  const statusLabel =
    a.status === "done" ? "Concluída" : a.status === "late" ? "Atrasada" : "Pendente";

  return (
    <Card className="rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={a.completed}
          aria-label={a.completed ? "Marcar como pendente" : "Marcar como concluída"}
          className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {a.completed ? (
            <CheckCircle2 className="h-7 w-7 text-success" />
          ) : (
            <Circle className="h-7 w-7" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{a.type}</h3>
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold " +
                statusColor
              }
            >
              <StatusIcon className="h-3 w-3" />
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(a.date + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}{" "}
            • {a.time}
          </p>
          {a.notes && <p className="mt-2 text-sm text-foreground/80">{a.notes}</p>}
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remover compromisso"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}

export function AppointmentForm({
  open,
  onOpenChange,
  defaultDate,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultDate?: string;
  onSubmit: (a: Omit<Appointment, "id" | "completed" | "petId">) => void;
}) {
  const [type, setType] = useState<Appointment["type"]>("Banho/Tosa");
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  const dateErr = !date ? "Data obrigatória" : "";
  const timeErr = !time ? "Horário obrigatório" : "";
  const valid = !dateErr && !timeErr;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Novo compromisso</DialogTitle>
          <DialogDescription>Preencha os dados do cuidado a agendar.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            onSubmit({ type, date, time, notes });
            setNotes("");
          }}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="ap-type">Tipo de cuidado</Label>
            <Select value={type} onValueChange={(v) => setType(v as Appointment["type"])}>
              <SelectTrigger id="ap-type" className="min-h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ap-date">Data</Label>
              <Input
                id="ap-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!dateErr}
              />
              {touched && dateErr && (
                <p className="text-xs text-destructive">{dateErr}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ap-time">Horário</Label>
              <Input
                id="ap-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!timeErr}
              />
              {touched && timeErr && (
                <p className="text-xs text-destructive">{timeErr}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap-notes">Notas (opcional)</Label>
            <Textarea
              id="ap-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: levar guia, jejum, contato do veterinário..."
              className="rounded-xl"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 rounded-xl">
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

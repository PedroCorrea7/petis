import { useMemo, useState } from "react";
import { Plus, Syringe, Paperclip, Trash2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { usePetis, daysUntil, type Vaccine } from "@/lib/petis-storage";
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
import { ConfirmDialog } from "./ConfirmDialog";

export function Vaccines({
  openForm,
  setOpenForm,
}: {
  openForm: boolean;
  setOpenForm: (o: boolean) => void;
}) {
  const { data, activePet, addVaccine, deleteVaccine } = usePetis();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [viewFile, setViewFile] = useState<Vaccine | null>(null);

  const items = useMemo(
    () =>
      data.vaccines
        .filter((v) => v.petId === activePet?.id)
        .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate)),
    [data.vaccines, activePet],
  );

  const applied = items;
  const upcoming = items
    .filter((v) => v.nextDate)
    .sort((a, b) => (a.nextDate ?? "").localeCompare(b.nextDate ?? ""));

  return (
    <div className="space-y-5 p-5 pb-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Carteira de vacinação</h1>
          <p className="text-sm text-muted-foreground">
            Histórico médico de {activePet?.name ?? "seu pet"}
          </p>
        </div>
        <Button
          onClick={() => setOpenForm(true)}
          className="min-h-11 rounded-2xl"
          aria-label="Registrar nova vacina"
        >
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </header>

      {/* Upcoming */}
      <section aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="mb-2 text-sm font-semibold text-muted-foreground">
          Próximas doses
        </h2>
        {upcoming.length === 0 ? (
          <Card className="rounded-2xl p-5 text-center text-sm text-muted-foreground">
            Nenhuma dose futura registrada.
          </Card>
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 3).map((v) => {
              const d = daysUntil(v.nextDate);
              const urgent = d !== null && d <= 30;
              const overdue = d !== null && d < 0;
              return (
                <li key={v.id}>
                  <Card
                    className={
                      "flex items-center gap-3 rounded-2xl p-4 " +
                      (overdue
                        ? "border-destructive/40 bg-destructive/5"
                        : urgent
                          ? "border-warning/50 bg-warning/10 animate-pulse-soft"
                          : "")
                    }
                  >
                    <span
                      className={
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl " +
                        (overdue
                          ? "bg-destructive text-destructive-foreground"
                          : urgent
                            ? "bg-warning text-warning-foreground"
                            : "bg-secondary text-secondary-foreground")
                      }
                    >
                      <Syringe className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{v.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {overdue
                          ? `Atrasada ${Math.abs(d!)} dia(s)`
                          : d === 0
                            ? "Vence hoje"
                            : `Em ${d} dia(s)`}{" "}
                        • {new Date(v.nextDate! + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Timeline */}
      <section aria-labelledby="history-title">
        <h2 id="history-title" className="mb-2 text-sm font-semibold text-muted-foreground">
          Histórico aplicado
        </h2>
        {applied.length === 0 ? (
          <Card className="rounded-2xl p-5 text-center text-sm text-muted-foreground">
            Sem registros. Toque em "Nova" para começar.
          </Card>
        ) : (
          <ol className="relative ml-3 border-l-2 border-border pl-5">
            {applied.map((v) => (
              <li key={v.id} className="relative mb-5 last:mb-0">
                <span
                  className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full bg-primary ring-4 ring-background"
                  aria-hidden
                >
                  <Syringe className="h-3 w-3 text-primary-foreground" />
                </span>
                <Card className="rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Aplicada em{" "}
                        {new Date(v.appliedDate + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                      {v.nextDate && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Próxima:{" "}
                          {new Date(v.nextDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {v.fileName && (
                        <button
                          type="button"
                          onClick={() => setViewFile(v)}
                          className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Paperclip className="h-3 w-3" />
                          {v.fileName}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(v.id)}
                      aria-label="Remover vacina"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>

      <VaccineForm
        open={openForm}
        onOpenChange={setOpenForm}
        onSubmit={(v) => {
          if (!activePet) {
            toast.error("Cadastre um pet primeiro.");
            return;
          }
          addVaccine({ ...v, petId: activePet.id });
          toast.success("Vacina registrada!");
          setOpenForm(false);
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Remover registro de vacina?"
        description="Esta ação não pode ser desfeita e pode afetar o histórico médico do pet."
        confirmLabel="Remover"
        destructive
        onConfirm={() => {
          if (pendingDelete) {
            deleteVaccine(pendingDelete);
            toast.success("Registro removido.");
          }
          setPendingDelete(null);
        }}
      />

      {/* File viewer modal */}
      <Dialog open={!!viewFile} onOpenChange={(o) => !o && setViewFile(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewFile?.fileName}
            </DialogTitle>
            <DialogDescription>Comprovante anexado à vacina.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            {viewFile?.fileData?.startsWith("data:image") ? (
              <img
                src={viewFile.fileData}
                alt={viewFile.fileName}
                className="h-auto w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
                <FileText className="h-12 w-12" />
                <p className="text-sm">Pré-visualização indisponível neste protótipo.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewFile(null)}
              className="min-h-11 rounded-xl"
            >
              <X className="h-4 w-4" /> Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VaccineForm({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: Omit<Vaccine, "id" | "petId">) => void;
}) {
  const [name, setName] = useState("");
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDate, setNextDate] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileData, setFileData] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const nameErr = !name.trim() ? "Nome obrigatório" : "";
  const dateErr = !appliedDate ? "Data obrigatória" : "";
  const valid = !nameErr && !dateErr;

  const reset = () => {
    setName("");
    setAppliedDate(new Date().toISOString().slice(0, 10));
    setNextDate("");
    setFileName(undefined);
    setFileData(undefined);
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
          <DialogTitle>Nova vacina</DialogTitle>
          <DialogDescription>Registre uma dose aplicada e a próxima.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            onSubmit({
              name: name.trim(),
              appliedDate,
              nextDate: nextDate || undefined,
              fileName,
              fileData,
            });
            reset();
          }}
          noValidate
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="v-name">Nome da vacina</Label>
            <Input
              id="v-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: V10, Antirrábica"
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!nameErr}
            />
            {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-applied">Aplicada em</Label>
              <Input
                id="v-applied"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!dateErr}
              />
              {touched && dateErr && <p className="text-xs text-destructive">{dateErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-next">Próxima dose</Label>
              <Input
                id="v-next"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="min-h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-file">Comprovante (opcional)</Label>
            <label
              htmlFor="v-file"
              className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 text-sm text-muted-foreground hover:bg-muted"
            >
              <Paperclip className="h-4 w-4" />
              {fileName ?? "Anexar imagem ou documento"}
            </label>
            <input
              id="v-file"
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                const reader = new FileReader();
                reader.onload = () => setFileData(reader.result as string);
                reader.readAsDataURL(f);
              }}
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
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

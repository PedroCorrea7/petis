import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Camera,
  Scale,
  AlertCircle,
  ChevronDown,
  Pencil,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { usePetis, calcAge, type Pet } from "@/lib/petis-storage";
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
import { ConfirmDialog } from "./ConfirmDialog";
import { PetFormDialog } from "./PetFormDialog";
import { ShareMedicalDialog } from "./ShareMedicalDialog";
import { PhotoLightbox } from "./PhotoLightbox";

export function PetProfile({
  openWeight,
  setOpenWeight,
}: {
  openWeight: boolean;
  setOpenWeight: (o: boolean) => void;
}) {
  const { data, activePet, setActivePet, deletePet, addWeight, deleteWeight, addPhoto } =
    usePetis();
  const [openAddPet, setOpenAddPet] = useState(false);
  const [openEditPet, setOpenEditPet] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openSwitcher, setOpenSwitcher] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingWeightDelete, setPendingWeightDelete] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!activePet) {
    return (
      <div className="space-y-4 p-5">
        <h1 className="text-xl font-bold">Perfil</h1>
        <Card className="rounded-2xl p-6 text-center text-muted-foreground">
          Nenhum pet cadastrado.
        </Card>
        <Button onClick={() => setOpenAddPet(true)} className="w-full min-h-11 rounded-2xl">
          <Plus className="h-4 w-4" /> Adicionar pet
        </Button>
        <PetFormDialog open={openAddPet} onOpenChange={setOpenAddPet} mode="create" />
      </div>
    );
  }

  const sortedWeights = useMemo(
    () => [...activePet.weights].sort((a, b) => a.date.localeCompare(b.date)),
    [activePet.weights],
  );
  const latest = sortedWeights.at(-1)?.kg ?? null;
  const maxW = Math.max(...sortedWeights.map((w) => w.kg), 1);
  const minW = Math.min(...sortedWeights.map((w) => w.kg), 0);

  return (
    <div className="space-y-5 p-5 pb-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Perfil</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenSwitcher(true)}
            className="min-h-11 rounded-2xl"
          >
            Trocar pet <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setOpenAddPet(true)}
            className="min-h-11 rounded-2xl"
            aria-label="Adicionar novo pet"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main card */}
      <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-md">
        <div className="bg-gradient-to-br from-secondary to-secondary/50 p-6 text-center">
          <div className="mx-auto w-fit">
            <PetAvatar pet={activePet} size={112} />
          </div>
          <h2 className="mt-3 text-2xl font-bold">{activePet.name}</h2>
          <p className="text-sm text-secondary-foreground/80">
            {activePet.breed} • {calcAge(activePet.birthDate)}
            {activePet.gender ? ` • ${activePet.gender}` : ""}
          </p>
          <Button
            onClick={() => setOpenEditPet(true)}
            variant="outline"
            className="mt-4 min-h-11 rounded-2xl bg-card"
          >
            <Pencil className="h-4 w-4" /> Editar Perfil
          </Button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border bg-card">
          <Stat label="Espécie" value={activePet.species} />
          <Stat label="Peso" value={latest ? `${latest} kg` : "—"} />
          <Stat label="Registros" value={String(sortedWeights.length)} />
        </div>
      </Card>

      {/* Share medical record */}
      <Button
        onClick={() => setOpenShare(true)}
        className="w-full min-h-12 rounded-2xl bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
      >
        <ClipboardList className="h-5 w-5" /> 📋 Compartilhar Ficha Médica
      </Button>

      {/* Weight history */}
      <Card className="rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-1.5 font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" /> 📈 Histórico de Peso
            </h3>
            <p className="text-xs text-muted-foreground">Evolução cronológica</p>
          </div>
          <Button
            size="sm"
            onClick={() => setOpenWeight(true)}
            className="min-h-11 rounded-xl"
            aria-label="Registrar nova pesagem"
          >
            <Scale className="h-4 w-4" /> + Registrar Peso
          </Button>
        </div>
        {sortedWeights.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem pesagens ainda. Registre o peso atual para começar o histórico.
          </p>
        ) : (
          <>
            <WeightChart weights={sortedWeights} minW={minW} maxW={maxW} />
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {[...sortedWeights]
                .map((w, idx) => ({ ...w, _idx: idx }))
                .reverse()
                .map((w) => {
                  const originalIdx = activePet.weights.findIndex(
                    (orig) => orig.date === w.date && orig.kg === w.kg,
                  );
                  return (
                    <li key={`${w.date}-${w.kg}-${w._idx}`} className="flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{w.kg} kg</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.date + "T00:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingWeightDelete(originalIdx)}
                        aria-label="Excluir pesagem"
                        className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </Card>

      {/* Notes (read-only summary; full edit in form) */}
      <Card className="rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-accent" />
          <h3 className="font-semibold">Observações médicas</h3>
        </div>
        {activePet.notes?.trim() ? (
          <p className="whitespace-pre-wrap text-sm text-foreground/90">{activePet.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma observação. Toque em <span className="font-medium">Editar Perfil</span> para
            adicionar alergias ou cuidados especiais.
          </p>
        )}
      </Card>

      {/* Photo album */}
      <Card className="rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Álbum de fotos</h3>
          <label
            htmlFor="album-upload"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Camera className="h-4 w-4" /> Adicionar
          </label>
          <input
            id="album-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                addPhoto(activePet.id, reader.result as string);
                toast.success("Foto adicionada ao álbum!");
              };
              reader.readAsDataURL(f);
              e.target.value = "";
            }}
          />
        </div>
        {activePet.photos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem fotos ainda. Adicione momentos marcantes do {activePet.name}.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activePet.photos.map((p, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setLightboxIdx(i)}
                aria-label={`Abrir foto ${i + 1} em tela cheia`}
                className="group aspect-square overflow-hidden rounded-xl bg-muted transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
              >
                <img
                  src={p}
                  alt={`Foto ${i + 1} de ${activePet.name}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
        <PhotoLightbox
          photos={activePet.photos}
          index={lightboxIdx}
          onChange={setLightboxIdx}
          onClose={() => setLightboxIdx(null)}
          alt={activePet.name}
        />
      </Card>

      <Button
        variant="outline"
        onClick={() => setPendingDelete(activePet.id)}
        className="w-full min-h-11 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" /> Remover {activePet.name}
      </Button>

      <AddWeightDialog
        open={openWeight}
        onOpenChange={setOpenWeight}
        onSubmit={(kg, date) => {
          addWeight(activePet.id, kg, date);
          toast.success("Pesagem registrada!");
          setOpenWeight(false);
        }}
      />
      <PetFormDialog open={openAddPet} onOpenChange={setOpenAddPet} mode="create" />
      <PetFormDialog
        open={openEditPet}
        onOpenChange={setOpenEditPet}
        mode="edit"
        pet={activePet}
      />
      <ShareMedicalDialog pet={activePet} open={openShare} onOpenChange={setOpenShare} />

      {/* Pet switcher */}
      <Dialog open={openSwitcher} onOpenChange={setOpenSwitcher}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Selecionar pet</DialogTitle>
            <DialogDescription>Escolha o pet ativo no aplicativo.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {data.pets.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActivePet(p.id);
                    setOpenSwitcher(false);
                    toast.success(`${p.name} é o pet ativo agora.`);
                  }}
                  className={
                    "flex min-h-14 w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (p.id === activePet.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-secondary/50")
                  }
                >
                  <PetAvatar pet={p} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.breed}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Remover ${activePet.name}?`}
        description="Todos os dados, agenda e vacinas deste pet serão apagados permanentemente."
        confirmLabel="Sim, remover"
        destructive
        onConfirm={() => {
          if (pendingDelete) {
            deletePet(pendingDelete);
            toast.success("Pet removido.");
          }
          setPendingDelete(null);
        }}
      />

      <ConfirmDialog
        open={pendingWeightDelete !== null}
        onOpenChange={(o) => !o && setPendingWeightDelete(null)}
        title="Excluir esta pesagem?"
        description="O registro será removido do histórico."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          if (pendingWeightDelete !== null && pendingWeightDelete >= 0) {
            deleteWeight(activePet.id, pendingWeightDelete);
            toast.success("Pesagem removida.");
          }
          setPendingWeightDelete(null);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function WeightChart({
  weights,
  minW,
  maxW,
}: {
  weights: Pet["weights"];
  minW: number;
  maxW: number;
}) {
  const range = Math.max(maxW - minW, 0.1);
  const w = 280;
  const h = 110;
  const pad = 10;
  const step = weights.length > 1 ? (w - pad * 2) / (weights.length - 1) : 0;
  const pts = weights.map((wt, i) => {
    const x = pad + i * step;
    const y = h - pad - ((wt.kg - minW) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-28 w-full"
        role="img"
        aria-label="Gráfico de evolução do peso"
      >
        {weights.length > 1 && (
          <path
            d={`${path} L ${pad + (weights.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`}
            fill="oklch(0.62 0.13 235 / 0.15)"
          />
        )}
        <path
          d={path}
          stroke="oklch(0.62 0.13 235)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="oklch(0.62 0.13 235)" />
            <text
              x={x}
              y={y - 8}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              className="font-medium"
            >
              {weights[i].kg}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AddWeightDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (kg: number, date: string) => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [val, setVal] = useState("");
  const [date, setDate] = useState(todayStr);
  const [touched, setTouched] = useState(false);
  const n = Number(val.replace(",", "."));
  const kgErr = !val
    ? "Informe o peso"
    : Number.isNaN(n) || n <= 0
      ? "Peso deve ser maior que zero"
      : "";
  const dateErr = !date
    ? "Informe a data"
    : new Date(date) > new Date()
      ? "Data não pode ser futura"
      : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setVal("");
          setDate(todayStr);
          setTouched(false);
        }
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Registrar peso</DialogTitle>
          <DialogDescription>
            Registre o peso atual ou uma pesagem retroativa (até meses atrás).
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (kgErr || dateErr) return;
            onSubmit(Number(n.toFixed(2)), date);
            setVal("");
            setDate(todayStr);
            setTouched(false);
          }}
          noValidate
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="w-kg">Peso (kg)</Label>
            <Input
              id="w-kg"
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Ex.: 12,4"
              className="min-h-11 rounded-xl text-lg"
              aria-invalid={touched && !!kgErr}
            />
            {touched && kgErr && <p className="text-xs text-destructive">{kgErr}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="w-date">Data da pesagem</Label>
            <Input
              id="w-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayStr}
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!dateErr}
            />
            {touched && dateErr && <p className="text-xs text-destructive">{dateErr}</p>}
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
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

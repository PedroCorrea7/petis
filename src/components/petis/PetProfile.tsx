import { useMemo, useState } from "react";
import { Plus, Trash2, Camera, Scale, AlertCircle, ChevronDown } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "./ConfirmDialog";

export function PetProfile({
  openWeight,
  setOpenWeight,
}: {
  openWeight: boolean;
  setOpenWeight: (o: boolean) => void;
}) {
  const { data, activePet, setActivePet, deletePet, updatePet, addWeight, addPhoto } = usePetis();
  const [openAddPet, setOpenAddPet] = useState(false);
  const [openSwitcher, setOpenSwitcher] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

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
        <AddPetDialog open={openAddPet} onOpenChange={setOpenAddPet} />
      </div>
    );
  }

  const latest = activePet.weights.at(-1)?.kg ?? null;
  const maxW = Math.max(...activePet.weights.map((w) => w.kg), 1);
  const minW = Math.min(...activePet.weights.map((w) => w.kg), 0);

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
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border bg-card">
          <Stat label="Espécie" value={activePet.species} />
          <Stat label="Peso" value={latest ? `${latest} kg` : "—"} />
          <Stat label="Registros" value={String(activePet.weights.length)} />
        </div>
      </Card>

      {/* Weight chart */}
      <Card className="rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Evolução do peso</h3>
            <p className="text-xs text-muted-foreground">Histórico de pesagens</p>
          </div>
          <Button
            size="sm"
            onClick={() => setOpenWeight(true)}
            className="min-h-11 rounded-xl"
            aria-label="Adicionar nova pesagem"
          >
            <Scale className="h-4 w-4" /> Pesar
          </Button>
        </div>
        {activePet.weights.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Sem pesagens ainda.</p>
        ) : (
          <WeightChart weights={activePet.weights} minW={minW} maxW={maxW} />
        )}
      </Card>

      {/* Notes */}
      <Card className="rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-accent" />
          <h3 className="font-semibold">Observações médicas</h3>
        </div>
        <Textarea
          value={activePet.notes ?? ""}
          onChange={(e) => updatePet(activePet.id, { notes: e.target.value })}
          placeholder="Ex.: alergias, restrições alimentares, medicação contínua..."
          rows={3}
          className="rounded-xl"
          aria-label="Observações médicas"
        />
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
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                <img
                  src={p}
                  alt={`Foto ${i + 1} de ${activePet.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
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
        onSubmit={(kg) => {
          addWeight(activePet.id, kg);
          toast.success("Pesagem registrada!");
          setOpenWeight(false);
        }}
      />
      <AddPetDialog open={openAddPet} onOpenChange={setOpenAddPet} />

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
  const h = 100;
  const pad = 8;
  const step = weights.length > 1 ? (w - pad * 2) / (weights.length - 1) : 0;
  const pts = weights.map((wt, i) => {
    const x = pad + i * step;
    const y = h - pad - ((wt.kg - minW) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="Gráfico de evolução do peso">
        <path
          d={`${path} L ${pad + (weights.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`}
          fill="oklch(0.62 0.13 235 / 0.15)"
        />
        <path d={path} stroke="oklch(0.62 0.13 235)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="oklch(0.62 0.13 235)" />
        ))}
      </svg>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {weights.slice(-4).map((w, i) => (
          <li key={i}>
            {new Date(w.date + "T00:00:00").toLocaleDateString("pt-BR", {
              month: "short",
              year: "2-digit",
            })}{" "}
            • <span className="font-semibold text-foreground">{w.kg} kg</span>
          </li>
        ))}
      </ul>
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
  onSubmit: (kg: number) => void;
}) {
  const [val, setVal] = useState("");
  const [touched, setTouched] = useState(false);
  const n = Number(val.replace(",", "."));
  const err = !val ? "Informe o peso" : Number.isNaN(n) || n <= 0 ? "Peso inválido" : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setVal("");
          setTouched(false);
        }
      }}
    >
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Atualizar peso</DialogTitle>
          <DialogDescription>Registre o peso atual do seu pet em kg.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (err) return;
            onSubmit(Number(n.toFixed(2)));
            setVal("");
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
              aria-invalid={touched && !!err}
            />
            {touched && err && <p className="text-xs text-destructive">{err}</p>}
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

function AddPetDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addPet } = usePetis();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Cachorro");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const nameErr = !name.trim() ? "Nome obrigatório" : "";
  const breedErr = !breed.trim() ? "Raça obrigatória" : "";
  const dateErr = !birthDate
    ? "Data obrigatória"
    : new Date(birthDate) > new Date()
      ? "Data não pode ser futura"
      : "";
  const valid = !nameErr && !breedErr && !dateErr;

  const reset = () => {
    setName("");
    setSpecies("Cachorro");
    setBreed("");
    setBirthDate("");
    setPhoto(undefined);
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
          <DialogTitle>Novo pet</DialogTitle>
          <DialogDescription>Adicione um novo companheiro ao Petis.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            addPet({ name: name.trim(), species, breed: breed.trim(), birthDate, photo });
            toast.success(`${name} adicionado(a)!`);
            reset();
            onOpenChange(false);
          }}
          noValidate
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <label
              htmlFor="p-photo"
              className="grid h-16 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-secondary text-secondary-foreground hover:opacity-90"
            >
              {photo ? (
                <img src={photo} alt="Pré-visualização" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </label>
            <input
              id="p-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => setPhoto(r.result as string);
                r.readAsDataURL(f);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Foto opcional. Toque no círculo para escolher.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-name">Nome</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!nameErr}
            />
            {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-species">Espécie</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger id="p-species" className="min-h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cachorro">Cachorro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Coelho">Coelho</SelectItem>
                  <SelectItem value="Ave">Ave</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-breed">Raça</Label>
              <Input
                id="p-breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!breedErr}
              />
              {touched && breedErr && <p className="text-xs text-destructive">{breedErr}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-birth">Data de nascimento</Label>
            <Input
              id="p-birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

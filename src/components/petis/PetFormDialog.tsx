import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { usePetis, type Pet } from "@/lib/petis-storage";
import { Button } from "@/components/ui/button";
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

type Mode = "create" | "edit";

export function PetFormDialog({
  open,
  onOpenChange,
  mode = "create",
  pet,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode?: Mode;
  pet?: Pet | null;
}) {
  const { addPet, updatePet } = usePetis();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Cachorro");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"Macho" | "Fêmea" | "">("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && mode === "edit" && pet) {
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed);
      setBirthDate(pet.birthDate);
      setGender((pet.gender as "Macho" | "Fêmea" | "") ?? "");
      setNotes(pet.notes ?? "");
      setPhoto(pet.photo);
      setTouched(false);
    }
    if (open && mode === "create") {
      setName("");
      setSpecies("Cachorro");
      setBreed("");
      setBirthDate("");
      setGender("");
      setNotes("");
      setPhoto(undefined);
      setTouched(false);
    }
  }, [open, mode, pet]);

  const nameErr = !name.trim() ? "Nome obrigatório" : "";
  const breedErr = !breed.trim() ? "Raça obrigatória" : "";
  const dateErr = !birthDate
    ? "Data obrigatória"
    : new Date(birthDate) > new Date()
      ? "Data não pode ser futura"
      : "";
  const valid = !nameErr && !breedErr && !dateErr;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar perfil" : "Novo pet"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Atualize as informações do seu companheiro."
              : "Adicione um novo companheiro ao Petis."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            const data = {
              name: name.trim(),
              species,
              breed: breed.trim(),
              birthDate,
              gender,
              notes: notes.trim(),
              photo,
            };
            if (mode === "edit" && pet) {
              updatePet(pet.id, data);
              toast.success("Perfil atualizado!");
            } else {
              addPet(data);
              toast.success(`${name} adicionado(a)!`);
            }
            onOpenChange(false);
          }}
          noValidate
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <label
              htmlFor="pf-photo"
              className="grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-secondary text-secondary-foreground hover:opacity-90"
            >
              {photo ? (
                <img src={photo} alt="Pré-visualização" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-7 w-7" />
              )}
            </label>
            <input
              id="pf-photo"
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
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Foto do pet</p>
              <p>Toque no círculo para {photo ? "trocar" : "adicionar"}.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Nome</Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!nameErr}
            />
            {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-species">Espécie</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger id="pf-species" className="min-h-11 rounded-xl">
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
              <Label htmlFor="pf-breed">Raça</Label>
              <Input
                id="pf-breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!breedErr}
              />
              {touched && breedErr && <p className="text-xs text-destructive">{breedErr}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-birth">Nascimento</Label>
              <Input
                id="pf-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="min-h-11 rounded-xl"
                aria-invalid={touched && !!dateErr}
              />
              {touched && dateErr && <p className="text-xs text-destructive">{dateErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-gender">Gênero</Label>
              <Select
                value={gender || "none"}
                onValueChange={(v) => setGender(v === "none" ? "" : (v as "Macho" | "Fêmea"))}
              >
                <SelectTrigger id="pf-gender" className="min-h-11 rounded-xl">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informar</SelectItem>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-notes">Observações médicas</Label>
            <Textarea
              id="pf-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, restrições, medicação contínua..."
              rows={3}
              className="rounded-xl"
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
              {mode === "edit" ? "Salvar alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

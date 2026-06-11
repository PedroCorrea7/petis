import { useMemo, useState } from "react";
import { Copy, Check, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePetis, calcAge, type Pet } from "@/lib/petis-storage";

export function ShareMedicalDialog({
  pet,
  open,
  onOpenChange,
}: {
  pet: Pet | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data } = usePetis();
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    if (!pet) return "";
    const latest = pet.weights.length
      ? [...pet.weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
      : null;
    const lastVaccines = data.vaccines
      .filter((v) => v.petId === pet.id)
      .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
      .slice(0, 3);
    const lines = [
      `🐾 *Ficha Médica — ${pet.name}*`,
      ``,
      `• Espécie: ${pet.species}`,
      `• Raça: ${pet.breed}`,
      `• Idade: ${calcAge(pet.birthDate)}`,
      pet.gender ? `• Gênero: ${pet.gender}` : null,
      `• Peso atual: ${latest ? `${latest.kg} kg (${new Date(latest.date + "T00:00:00").toLocaleDateString("pt-BR")})` : "não registrado"}`,
      ``,
      `*Observações / Alergias:*`,
      pet.notes?.trim() ? pet.notes.trim() : "Nenhuma observação registrada.",
      ``,
      `*Últimas vacinas:*`,
      lastVaccines.length
        ? lastVaccines
            .map(
              (v) =>
                `- ${v.name} — ${new Date(v.appliedDate + "T00:00:00").toLocaleDateString("pt-BR")}`,
            )
            .join("\n")
        : "Nenhuma vacina registrada.",
      ``,
      `_Gerado pelo Petis_`,
    ];
    return lines.filter(Boolean).join("\n");
  }, [pet, data.vaccines]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Ficha copiada! Cole no WhatsApp do veterinário.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Ficha médica
          </DialogTitle>
          <DialogDescription>
            Resumo pronto para enviar ao veterinário em situações de urgência.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-muted/50 p-4 font-sans text-sm leading-relaxed text-foreground">
          {text}
        </pre>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-11 rounded-xl"
          >
            Fechar
          </Button>
          <Button type="button" onClick={copy} className="min-h-11 rounded-xl">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar para Área de Transferência"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

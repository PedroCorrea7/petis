import { useEffect, useState } from "react";
import {
  User,
  Languages,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, maskPhone } from "@/lib/petis-storage";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PetisLogo } from "./PetisLogo";

type Sub = null | "profile" | "language" | "help" | "terms";

export function SettingsSidebar({
  open,
  onOpenChange,
  onRequestLogout,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onRequestLogout: () => void;
}) {
  const { user } = useAuth();
  const [sub, setSub] = useState<Sub>(null);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[88%] max-w-sm rounded-r-3xl p-0">
          <SheetHeader className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <UserAvatar photo={user?.photo} name={user?.name ?? ""} />
              <div className="min-w-0 flex-1 text-left">
                <SheetTitle className="truncate text-base text-primary-foreground">
                  {user?.name ?? "Visitante"}
                </SheetTitle>
                <SheetDescription className="truncate text-xs text-primary-foreground/80">
                  {user?.email ?? ""}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-3">
            <SectionLabel>Conta</SectionLabel>
            <MenuItem
              icon={<User className="h-5 w-5" />}
              label="Meu Perfil"
              onClick={() => setSub("profile")}
            />

            <SectionLabel>Configurações básicas</SectionLabel>
            <MenuItem
              icon={<Languages className="h-5 w-5" />}
              label="Idioma"
              hint="Português (BR)"
              onClick={() => setSub("language")}
            />
            <MenuItem
              icon={<HelpCircle className="h-5 w-5" />}
              label="Central de Ajuda / FAQ"
              onClick={() => setSub("help")}
            />
            <MenuItem
              icon={<FileText className="h-5 w-5" />}
              label="Termos de Uso"
              onClick={() => setSub("terms")}
            />
          </nav>

          <div className="mt-auto p-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onRequestLogout();
              }}
              className="w-full min-h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <PetisLogo size={16} /> Petis · v1.0
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UserProfileDialog open={sub === "profile"} onClose={() => setSub(null)} />
      <InfoDialog
        open={sub === "language"}
        onClose={() => setSub(null)}
        title="Idioma"
        description="Selecione o idioma do aplicativo (simulação)."
      >
        <LanguageSwitcher />
      </InfoDialog>
      <InfoDialog
        open={sub === "help"}
        onClose={() => setSub(null)}
        title="Central de Ajuda · FAQ"
        description="Respostas para as dúvidas mais comuns."
      >
        <FAQContent />
      </InfoDialog>
      <InfoDialog
        open={sub === "terms"}
        onClose={() => setSub(null)}
        title="Termos de Uso"
        description="Resumo simplificado para este protótipo."
      >
        <TermsContent />
      </InfoDialog>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 items-center gap-3 rounded-2xl px-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-foreground">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function UserAvatar({ photo, name }: { photo?: string; name: string }) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-primary-foreground/20 text-xl font-bold">
      {photo ? (
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

/* ============ User profile dialog ============ */

function UserProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setPhoto(user.photo);
      setTouched(false);
    }
  }, [open, user]);

  const nameErr = name.trim().split(/\s+/).length < 2 ? "Informe nome completo" : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneErr = phoneDigits.length < 10 ? "Telefone incompleto" : "";

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Meu perfil</DialogTitle>
          <DialogDescription>
            Atualize seus dados pessoais. As alterações ficam salvas neste dispositivo.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (nameErr || phoneErr) return;
            updateUser({ name: name.trim(), phone: maskPhone(phone), photo });
            toast.success("Perfil atualizado!");
            onClose();
          }}
          noValidate
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-secondary text-2xl font-bold text-secondary-foreground">
              {photo ? (
                <img src={photo} alt="Foto do tutor" className="h-full w-full object-cover" />
              ) : (
                <span>{(name.trim()[0] ?? "?").toUpperCase()}</span>
              )}
            </div>
            <div>
              <label
                htmlFor="user-photo"
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" /> Trocar foto
              </label>
              <input
                id="user-photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
              />
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="ml-2 text-xs text-muted-foreground underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-name">Nome completo</Label>
            <Input
              id="u-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!nameErr}
            />
            {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-phone">Telefone</Label>
            <Input
              id="u-phone"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              inputMode="tel"
              placeholder="(11) 98765-4321"
              className="min-h-11 rounded-xl"
              aria-invalid={touched && !!phoneErr}
            />
            {touched && phoneErr && <p className="text-xs text-destructive">{phoneErr}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled className="min-h-11 rounded-xl" />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 rounded-xl">
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Info dialogs ============ */

function InfoDialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">{children}</div>
        <DialogFooter>
          <Button onClick={onClose} className="min-h-11 rounded-xl">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LanguageSwitcher() {
  const [lang, setLang] = useState<"pt-BR" | "en-US" | "es-ES">("pt-BR");
  return (
    <div className="space-y-2">
      {(
        [
          { v: "pt-BR", label: "🇧🇷 Português (Brasil)" },
          { v: "en-US", label: "🇺🇸 English (US)" },
          { v: "es-ES", label: "🇪🇸 Español" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => {
            setLang(opt.v);
            toast.success(`Idioma alterado para ${opt.label}`, {
              description: "Simulação — a tradução completa virá em breve.",
            });
          }}
          className={
            "flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition-colors " +
            (lang === opt.v ? "border-primary bg-secondary" : "border-border hover:bg-secondary/50")
          }
        >
          <span className="text-sm font-medium">{opt.label}</span>
          {lang === opt.v && (
            <span className="text-xs font-semibold text-primary">Ativo</span>
          )}
        </button>
      ))}
    </div>
  );
}

function FAQContent() {
  const items = [
    {
      q: "Como cadastrar um novo pet?",
      a: "Na tela inicial, toque em + Cadastrar Meu Pet. No perfil você pode adicionar mais pets pelo botão +.",
    },
    {
      q: "Onde meus dados ficam armazenados?",
      a: "Todos os dados ficam neste dispositivo (localStorage). Nada é enviado para servidores.",
    },
    {
      q: "Como recebo lembretes de vacinas?",
      a: "Ao registrar uma vacina com data da próxima dose, o app mostrará alertas na aba Vacinas.",
    },
    {
      q: "Posso compartilhar a ficha médica?",
      a: "Sim! No perfil do pet, toque em Compartilhar Ficha Médica para gerar um resumo pronto.",
    },
  ];
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.q} className="rounded-2xl border border-border bg-secondary/30 p-3">
          <p className="font-semibold">{it.q}</p>
          <p className="mt-1 text-muted-foreground">{it.a}</p>
        </li>
      ))}
    </ul>
  );
}

function TermsContent() {
  return (
    <div className="space-y-2 text-muted-foreground">
      <p>
        O <strong>Petis</strong> é um protótipo educacional para gestão da rotina, saúde e
        bem-estar do seu pet. Ao usar o aplicativo você concorda que:
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>Os dados ficam salvos apenas neste dispositivo (localStorage).</li>
        <li>O app não substitui consulta veterinária profissional.</li>
        <li>Você é responsável pelas informações inseridas no sistema.</li>
        <li>
          Limpar o cache do navegador apaga permanentemente todos os seus dados cadastrados.
        </li>
      </ul>
      <p className="pt-2 text-xs">Última atualização: junho de 2026.</p>
    </div>
  );
}

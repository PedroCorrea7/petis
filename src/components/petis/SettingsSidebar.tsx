
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
import { t, useLanguage } from "@/lib/i18n";
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
  const { lang } = useLanguage();

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
            <SectionLabel>{t("account.section")}</SectionLabel>
            <MenuItem
              icon={<User className="h-5 w-5" />}
              label={t("my.profile")}
              onClick={() => setSub("profile")}
            />

            <SectionLabel>{t("basic.settings.section")}</SectionLabel>
            <MenuItem
              icon={<Languages className="h-5 w-5" />}
              label={t("language")}
              hint={lang === "pt" ? "Português (BR)" : "English (US)"}
              onClick={() => setSub("language")}
            />
            <MenuItem
              icon={<HelpCircle className="h-5 w-5" />}
              label={t("help.center")}
              onClick={() => setSub("help")}
            />
            <MenuItem
              icon={<FileText className="h-5 w-5" />}
              label={t("terms.of.use")}
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
              <LogOut className="h-4 w-4" /> {t("logout.button")}
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <PetisLogo size={16} /> {t("petis.version")}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UserProfileDialog open={sub === "profile"} onClose={() => setSub(null)} />
      <InfoDialog
        open={sub === "language"}
        onClose={() => setSub(null)}
        title={t("language.dialog.title")}
        description={t("language.dialog.description")}
      >
        <LanguageSwitcher />
      </InfoDialog>
      <InfoDialog
        open={sub === "help"}
        onClose={() => setSub(null)}
        title={t("faq.dialog.title")}
        description={t("faq.dialog.description")}
      >
        <FAQContent />
      </InfoDialog>
      <InfoDialog
        open={sub === "terms"}
        onClose={() => setSub(null)}
        title={t("terms.dialog.title")}
        description={t("terms.dialog.description")}
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
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (open && user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setPhoto(user.photo);
      setEmail(user.email ?? "");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTouched(false);
    }
  }, [open, user]);

  const nameErr = name.trim().split(/\s+/).length < 2 ? "Informe nome completo" : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneErr = phoneDigits.length < 10 ? "Telefone incompleto" : "";
  const passwordMismatchErr = newPassword && newPassword !== confirmNewPassword ? t("password.mismatch.error") : "";
  const oldPasswordErr = touched && oldPassword !== user?.password ? t("wrong.old.password.error") : "";

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameErr || phoneErr || passwordMismatchErr) return;

    if (oldPassword !== user?.password) {
      toast.error(t("wrong.old.password.error"));
      return;
    }

    if (email !== user?.email) {
      setVerificationModalOpen(true);
    } else {
      updateUser({
        name: name.trim(),
        phone: maskPhone(phone),
        photo,
        password: newPassword || user?.password,
      });
      toast.success("Perfil atualizado!");
      onClose();
    }
  };

  const handleConfirmVerification = () => {
    // For the prototype, accept any code
    updateUser({
      name: name.trim(),
      phone: maskPhone(phone),
      photo,
      email,
      password: newPassword || user?.password,
    });
    setVerificationModalOpen(false);
    toast.success("E-mail atualizado com sucesso!");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("edit.profile.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("edit.profile.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
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
                  <Camera className="h-4 w-4" /> {t("change.photo.button")}
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
                    {t("remove.photo.button")}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-name">{t("full.name.label")}</Label>
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
              <Label htmlFor="u-phone">{t("phone.label")}</Label>
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

            <h3 className="text-lg font-semibold">{t("credentials.section")}</h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="u-email">{t("change.email.label")}</Label>
              <Input
                id="u-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-old-password">{t("old.password.label")}</Label>
              <Input
                id="u-old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={!!oldPasswordErr}
              />
              {oldPasswordErr && <p className="text-xs text-destructive">{oldPasswordErr}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-new-password">{t("new.password.label")}</Label>
              <Input
                id="u-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="min-h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-confirm-new-password">{t("confirm.new.password.label")}</Label>
              <Input
                id="u-confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="min-h-11 rounded-xl"
                aria-invalid={!!passwordMismatchErr}
              />
              {passwordMismatchErr && <p className="text-xs text-destructive">{passwordMismatchErr}</p>}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-h-11 rounded-xl"
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="min-h-11 rounded-xl">
                {t("save.changes.button")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVerificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("verification.code.sent.title")}</DialogTitle>
            <DialogDescription>
              {t("verification.code.sent.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="verification-code">{t("verification.code.label")}</Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="min-h-11 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVerificationModalOpen(false)}
              className="min-h-11 rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmVerification}
              className="min-h-11 rounded-xl"
            >
              {t("confirm.button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage();
  return (
    <div className="space-y-2">
      {(
        [
          { v: "pt", label: t("lang.pt-BR") },
          { v: "en", label: t("lang.en-US") },
        ] as const
      ).map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => setLanguage(opt.v)}
          className={
            "flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition-colors " +
            (lang === opt.v ? "border-primary bg-secondary" : "border-border hover:bg-secondary/50")
          }
        >
          <span className="text-sm font-medium">{opt.label}</span>
          {lang === opt.v && (
            <span className="text-xs font-semibold text-primary">{t("active.language")}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function FAQContent() {
  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
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
        {t("terms.p1.start")} <strong>Petis</strong> {t("terms.p1.end")}
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>{t("terms.li1")}</li>
        <li>{t("terms.li2")}</li>
        <li>{t("terms.li3")}</li>
        <li>{t("terms.li4")}</li>
      </ul>
      <p className="pt-2 text-xs">{t("terms.p2")}</p>
    </div>
  );
}

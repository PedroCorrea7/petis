import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth, hasRegisteredUsers, maskPhone } from "@/lib/petis-storage";
import { PetisLogo } from "./PetisLogo";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(() =>
    hasRegisteredUsers() ? "login" : "register",
  );

  // Shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");

  const [touched, setTouched] = useState(false);
  // Server-side style validation errors (set after submit)
  const [emailServerErr, setEmailServerErr] = useState("");
  const [pwServerErr, setPwServerErr] = useState("");

  if (user) return <>{children}</>;

  const emailFormatErr =
    !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "E-mail inválido" : "";
  const pwErr = password.length < 4 ? "Mínimo 4 caracteres" : "";
  const nameErr = mode === "register" && name.trim().split(/\s+/).length < 2
    ? "Informe nome completo"
    : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneErr =
    mode === "register" && phoneDigits.length < 10 ? "Telefone incompleto" : "";
  const confirmErr =
    mode === "register" && confirm !== password ? "As senhas não coincidem" : "";

  const valid =
    !emailFormatErr && !pwErr && (mode === "login" || (!nameErr && !phoneErr && !confirmErr));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setEmailServerErr("");
    setPwServerErr("");
    if (!valid) return;

    if (mode === "register") {
      const res = register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: maskPhone(phone),
      });
      if (!res.ok) {
        setEmailServerErr("Este e-mail já está cadastrado. Faça login.");
        return;
      }
      toast.success(`Bem-vindo(a), ${name.trim().split(" ")[0]}! 🐾`);
    } else {
      const res = login(email.trim(), password);
      if (!res.ok) {
        if (res.reason === "no-email") {
          setEmailServerErr(
            "❌ Este e-mail não está cadastrado no sistema. Verifique a grafia ou crie uma nova conta.",
          );
        } else {
          setPwServerErr(
            "❌ Senha incorreta. Tente novamente ou use a opção de recuperar senha.",
          );
          setPassword("");
        }
        return;
      }
      toast.success("Login realizado!");
    }
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setTouched(false);
    setEmailServerErr("");
    setPwServerErr("");
  };

  const emailHasError = (touched && !!emailFormatErr) || !!emailServerErr;
  const pwHasError = (touched && !!pwErr) || !!pwServerErr;

  const errorInputCls =
    "border-destructive ring-1 ring-destructive/40 focus-visible:ring-destructive";

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col bg-background px-6 pb-8 pt-6 shadow-2xl sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:overflow-hidden"
      lang="pt-BR"
    >
      <div className="flex justify-end">
        <DarkModeToggle />
      </div>

      <div className="mt-2 flex flex-col items-center gap-3 text-center">
        <PetisLogo size={72} />
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Petis</h1>
        <p className="text-sm text-muted-foreground">
          A rotina, saúde e carinho do seu pet em um só lugar.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Autenticação"
        className="mt-7 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1"
      >
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={
              "min-h-11 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-secondary-foreground/70 hover:text-secondary-foreground")
            }
          >
            {m === "login" ? "Entrar" : "Criar Conta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3">
        {mode === "register" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Nome completo</Label>
              <Input
                id="a-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Maria Oliveira"
                className={"min-h-12 rounded-xl " + (touched && nameErr ? errorInputCls : "")}
                aria-invalid={touched && !!nameErr}
                autoComplete="name"
              />
              {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-phone">Telefone</Label>
              <Input
                id="a-phone"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                inputMode="tel"
                className={"min-h-12 rounded-xl " + (touched && phoneErr ? errorInputCls : "")}
                aria-invalid={touched && !!phoneErr}
                autoComplete="tel"
              />
              {touched && phoneErr && <p className="text-xs text-destructive">{phoneErr}</p>}
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="a-email">E-mail</Label>
          <Input
            id="a-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailServerErr) setEmailServerErr("");
            }}
            placeholder="voce@email.com"
            className={"min-h-12 rounded-xl " + (emailHasError ? errorInputCls : "")}
            aria-invalid={emailHasError}
            autoComplete="email"
          />
          {touched && emailFormatErr && !emailServerErr && (
            <p className="text-xs text-destructive">{emailFormatErr}</p>
          )}
          {emailServerErr && (
            <p className="text-xs font-medium text-destructive">{emailServerErr}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="a-pw">Senha</Label>
          <Input
            id="a-pw"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (pwServerErr) setPwServerErr("");
            }}
            placeholder="••••••"
            className={"min-h-12 rounded-xl " + (pwHasError ? errorInputCls : "")}
            aria-invalid={pwHasError}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {touched && pwErr && !pwServerErr && (
            <p className="text-xs text-destructive">{pwErr}</p>
          )}
          {pwServerErr && (
            <p className="text-xs font-medium text-destructive">{pwServerErr}</p>
          )}
        </div>

        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="a-confirm">Confirmar senha</Label>
            <Input
              id="a-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              className={"min-h-12 rounded-xl " + (touched && confirmErr ? errorInputCls : "")}
              aria-invalid={touched && !!confirmErr}
              autoComplete="new-password"
            />
            {touched && confirmErr && <p className="text-xs text-destructive">{confirmErr}</p>}
          </div>
        )}

        <Button
          type="submit"
          className="mt-2 min-h-12 w-full rounded-2xl text-base font-semibold shadow-md"
        >
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-auto pt-6 text-center text-xs text-muted-foreground">
        Seus dados ficam salvos somente neste dispositivo.
      </p>
    </main>
  );
}

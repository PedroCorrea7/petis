import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth, getAuth } from "@/lib/petis-storage";
import { PetisLogo } from "./PetisLogo";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(() =>
    getAuth() ? "login" : "register",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  if (user?.loggedIn) return <>{children}</>;

  const emailErr =
    !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "E-mail inválido" : "";
  const pwErr = password.length < 4 ? "Mínimo 4 caracteres" : "";
  const nameErr = mode === "register" && !name.trim() ? "Informe seu nome" : "";
  const valid = !emailErr && !pwErr && !nameErr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    if (mode === "register") {
      register(name.trim(), email.trim(), password);
      toast.success(`Bem-vindo(a), ${name.trim()}! 🐾`);
    } else {
      const ok = login(email.trim(), password);
      if (!ok) {
        toast.error("E-mail ou senha incorretos.");
        return;
      }
      toast.success("Login realizado!");
    }
  };

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
            onClick={() => {
              setMode(m);
              setTouched(false);
            }}
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
          <div className="space-y-1.5">
            <Label htmlFor="a-name">Nome</Label>
            <Input
              id="a-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="min-h-12 rounded-xl"
              aria-invalid={touched && !!nameErr}
              autoComplete="name"
            />
            {touched && nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="a-email">E-mail</Label>
          <Input
            id="a-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="min-h-12 rounded-xl"
            aria-invalid={touched && !!emailErr}
            autoComplete="email"
          />
          {touched && emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a-pw">Senha</Label>
          <Input
            id="a-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="min-h-12 rounded-xl"
            aria-invalid={touched && !!pwErr}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {touched && pwErr && <p className="text-xs text-destructive">{pwErr}</p>}
        </div>

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

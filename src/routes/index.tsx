import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav, type TabKey } from "@/components/petis/BottomNav";
import { Dashboard } from "@/components/petis/Dashboard";
import { Agenda } from "@/components/petis/Agenda";
import { Vaccines } from "@/components/petis/Vaccines";
import { PetProfile } from "@/components/petis/PetProfile";
import { PetFormDialog } from "@/components/petis/PetFormDialog";
import { AuthGate } from "@/components/petis/AuthGate";
import { DarkModeToggle } from "@/components/petis/DarkModeToggle";
import { PetisLogo } from "@/components/petis/PetisLogo";
import { usePetis, useAuth } from "@/lib/petis-storage";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Petis — Rotina e saúde do seu pet" },
      {
        name: "description",
        content:
          "Gerencie a rotina, agenda, vacinas e bem-estar do seu pet em um único lugar.",
      },
      { property: "og:title", content: "Petis — Rotina e saúde do seu pet" },
      {
        property: "og:description",
        content:
          "Gerencie a rotina, agenda, vacinas e bem-estar do seu pet em um único lugar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <PetisLogo size={64} />
          <p className="text-sm text-muted-foreground">Carregando Petis...</p>
        </div>
      </main>
    );
  }

  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

function AppShell() {
  const { data } = usePetis();
  const { user, logout } = useAuth();
  const hasPet = data.pets.length > 0;

  const [tab, setTab] = useState<TabKey>("home");
  const [transitioning, setTransitioning] = useState(false);
  const [openAppointmentForm, setOpenAppointmentForm] = useState(false);
  const [openVaccineForm, setOpenVaccineForm] = useState(false);
  const [openWeightForm, setOpenWeightForm] = useState(false);
  const [openAddPet, setOpenAddPet] = useState(false);

  const changeTab = (k: TabKey) => {
    if (k === tab) return;
    setTransitioning(true);
    setTab(k);
    window.setTimeout(() => setTransitioning(false), 800);
  };

  const onQuickAction = (action: "vaccine" | "appointment" | "weight") => {
    if (!hasPet) {
      setOpenAddPet(true);
      return;
    }
    if (action === "vaccine") {
      changeTab("vaccines");
      setTimeout(() => setOpenVaccineForm(true), 850);
    } else if (action === "appointment") {
      changeTab("agenda");
      setTimeout(() => setOpenAppointmentForm(true), 850);
    } else {
      changeTab("profile");
      setTimeout(() => setOpenWeightForm(true), 850);
    }
  };

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col bg-background shadow-2xl sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:overflow-hidden"
      lang="pt-BR"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <PetisLogo size={28} />
          <span className="text-sm font-semibold tracking-tight">
            Petis{user?.name ? ` · ${user.name.split(" ")[0]}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <DarkModeToggle />
          <button
            type="button"
            onClick={() => {
              logout();
            }}
            aria-label="Sair"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {transitioning ? (
          <TabSkeleton />
        ) : (
          <>
            {tab === "home" && (
              <Dashboard
                onQuickAction={onQuickAction}
                onNavigate={changeTab}
                onAddPet={() => setOpenAddPet(true)}
              />
            )}
            {tab === "agenda" && hasPet && (
              <Agenda openForm={openAppointmentForm} setOpenForm={setOpenAppointmentForm} />
            )}
            {tab === "vaccines" && hasPet && (
              <Vaccines openForm={openVaccineForm} setOpenForm={setOpenVaccineForm} />
            )}
            {tab === "profile" && (
              <PetProfile openWeight={openWeightForm} setOpenWeight={setOpenWeightForm} />
            )}
          </>
        )}
      </div>
      <BottomNav
        active={tab}
        onChange={changeTab}
        hasPet={hasPet}
        onLockedTabClick={() => {
          changeTab("home");
          setOpenAddPet(true);
        }}
      />
      <PetFormDialog open={openAddPet} onOpenChange={setOpenAddPet} mode="create" />
      <Toaster position="top-center" richColors />
    </main>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );
}

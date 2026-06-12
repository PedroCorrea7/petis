import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
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
import { SettingsSidebar } from "@/components/petis/SettingsSidebar";
import { ConfirmDialog } from "@/components/petis/ConfirmDialog";
import { usePetis, useAuth } from "@/lib/petis-storage";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: t("app.title.long") },
      {
        name: "description",
        content: t("app.description.long"),
      },
      { property: "og:title", content: t("app.title.long") },
      {
        property: "og:description",
        content: t("app.description.long"),
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
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
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
  const [openSidebar, setOpenSidebar] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

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
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/60 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpenSidebar(true)}
            aria-label={t("open.settings.menu.label")}
            className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 pl-1">
            <PetisLogo size={26} />
            <span className="text-sm font-semibold tracking-tight">
              Petis{user?.name ? ` · ${user.name.split(" ")[0]}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <DarkModeToggle />
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            aria-label={t("logout.label")}
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
      <SettingsSidebar
        open={openSidebar}
        onOpenChange={setOpenSidebar}
        onRequestLogout={() => setConfirmLogout(true)}
      />
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title={t("confirm.logout.title")}
        description={t("confirm.logout.description")}
        confirmLabel={t("confirm.logout.label")}
        destructive
        onConfirm={() => {
          logout();
          setConfirmLogout(false);
          toast.success(t("logout.success.message"));
        }}
      />
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

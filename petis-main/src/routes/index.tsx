import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav, type TabKey } from "@/components/petis/BottomNav";
import { Dashboard } from "@/components/petis/Dashboard";
import { Agenda } from "@/components/petis/Agenda";
import { Vaccines } from "@/components/petis/Vaccines";
import { PetProfile } from "@/components/petis/PetProfile";

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
  const [tab, setTab] = useState<TabKey>("home");
  const [openAppointmentForm, setOpenAppointmentForm] = useState(false);
  const [openVaccineForm, setOpenVaccineForm] = useState(false);
  const [openWeightForm, setOpenWeightForm] = useState(false);

  const onQuickAction = (action: "vaccine" | "appointment" | "weight") => {
    if (action === "vaccine") {
      setTab("vaccines");
      setTimeout(() => setOpenVaccineForm(true), 50);
    } else if (action === "appointment") {
      setTab("agenda");
      setTimeout(() => setOpenAppointmentForm(true), 50);
    } else {
      setTab("profile");
      setTimeout(() => setOpenWeightForm(true), 50);
    }
  };

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col bg-background shadow-2xl sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:overflow-hidden"
      lang="pt-BR"
    >
      <div className="flex-1 overflow-y-auto">
        {tab === "home" && <Dashboard onQuickAction={onQuickAction} onNavigate={setTab} />}
        {tab === "agenda" && (
          <Agenda openForm={openAppointmentForm} setOpenForm={setOpenAppointmentForm} />
        )}
        {tab === "vaccines" && (
          <Vaccines openForm={openVaccineForm} setOpenForm={setOpenVaccineForm} />
        )}
        {tab === "profile" && (
          <PetProfile openWeight={openWeightForm} setOpenWeight={setOpenWeightForm} />
        )}
      </div>
      <BottomNav active={tab} onChange={setTab} />
      <Toaster position="top-center" richColors />
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string; // ISO
  photo?: string; // data URL or emoji fallback
  notes?: string;
  weights: { date: string; kg: number }[];
  photos: string[]; // data URLs
};

export type Task = {
  id: string;
  petId: string;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  completed: boolean;
};

export type Appointment = {
  id: string;
  petId: string;
  type: "Banho/Tosa" | "Consulta" | "Vacina" | "Medicação" | "Passeio";
  date: string; // ISO date
  time: string; // HH:mm
  notes?: string;
  completed: boolean;
};

export type Vaccine = {
  id: string;
  petId: string;
  name: string;
  appliedDate: string; // ISO
  nextDate?: string; // ISO
  fileName?: string;
  fileData?: string; // data URL
};

export type PetisData = {
  pets: Pet[];
  activePetId: string | null;
  tasks: Task[];
  appointments: Appointment[];
  vaccines: Vaccine[];
};

const KEY = "petis-data-v1";

const today = () => new Date().toISOString().slice(0, 10);

function seed(): PetisData {
  const petId = crypto.randomUUID();
  const t = today();
  return {
    pets: [
      {
        id: petId,
        name: "Max",
        species: "Cachorro",
        breed: "Golden Retriever",
        birthDate: "2021-05-12",
        notes: "Alérgico a dipirona. Ração hipoalergênica.",
        weights: [
          { date: "2024-01-10", kg: 28 },
          { date: "2024-06-10", kg: 29.5 },
          { date: "2025-01-10", kg: 30.2 },
          { date: "2025-09-10", kg: 31 },
        ],
        photos: [],
      },
    ],
    activePetId: petId,
    tasks: [
      { id: crypto.randomUUID(), petId, title: "Ração da manhã", date: t, completed: true },
      { id: crypto.randomUUID(), petId, title: "Passeio matinal", date: t, completed: true },
      { id: crypto.randomUUID(), petId, title: "Escovação dos dentes", date: t, completed: true },
      { id: crypto.randomUUID(), petId, title: "Ração da noite", date: t, completed: false },
      { id: crypto.randomUUID(), petId, title: "Vermífugo mensal", date: t, completed: false },
    ],
    appointments: [
      {
        id: crypto.randomUUID(),
        petId,
        type: "Banho/Tosa",
        date: t,
        time: "16:00",
        notes: "Pet shop da esquina",
        completed: false,
      },
      {
        id: crypto.randomUUID(),
        petId,
        type: "Consulta",
        date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        time: "10:30",
        notes: "Check-up anual",
        completed: false,
      },
    ],
    vaccines: [
      {
        id: crypto.randomUUID(),
        petId,
        name: "V10 (Polivalente)",
        appliedDate: "2024-08-15",
        nextDate: "2025-08-15",
      },
      {
        id: crypto.randomUUID(),
        petId,
        name: "Antirrábica",
        appliedDate: "2024-09-20",
        nextDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      },
    ],
  };
}

function load(): PetisData {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as PetisData;
  } catch {
    return seed();
  }
}

let memory: PetisData | null = null;
const listeners = new Set<() => void>();

function getData(): PetisData {
  if (!memory) memory = load();
  return memory;
}

function setData(updater: (d: PetisData) => PetisData) {
  const next = updater(getData());
  memory = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function usePetis() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const data = getData();
  const activePet = data.pets.find((p) => p.id === data.activePetId) ?? data.pets[0] ?? null;

  return {
    data,
    activePet,
    setActivePet: useCallback((id: string) => setData((d) => ({ ...d, activePetId: id })), []),
    addPet: useCallback(
      (pet: Omit<Pet, "id" | "weights" | "photos">) =>
        setData((d) => {
          const newPet: Pet = { ...pet, id: crypto.randomUUID(), weights: [], photos: [] };
          return { ...d, pets: [...d.pets, newPet], activePetId: newPet.id };
        }),
      [],
    ),
    updatePet: useCallback(
      (id: string, patch: Partial<Pet>) =>
        setData((d) => ({ ...d, pets: d.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      [],
    ),
    deletePet: useCallback(
      (id: string) =>
        setData((d) => {
          const pets = d.pets.filter((p) => p.id !== id);
          return {
            ...d,
            pets,
            activePetId: d.activePetId === id ? (pets[0]?.id ?? null) : d.activePetId,
            tasks: d.tasks.filter((t) => t.petId !== id),
            appointments: d.appointments.filter((a) => a.petId !== id),
            vaccines: d.vaccines.filter((v) => v.petId !== id),
          };
        }),
      [],
    ),
    addWeight: useCallback(
      (petId: string, kg: number) =>
        setData((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId ? { ...p, weights: [...p.weights, { date: today(), kg }] } : p,
          ),
        })),
      [],
    ),
    addPhoto: useCallback(
      (petId: string, dataUrl: string) =>
        setData((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId ? { ...p, photos: [dataUrl, ...p.photos] } : p,
          ),
        })),
      [],
    ),
    toggleTask: useCallback(
      (id: string) =>
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
      [],
    ),
    addTask: useCallback(
      (t: Omit<Task, "id" | "completed">) =>
        setData((d) => ({
          ...d,
          tasks: [...d.tasks, { ...t, id: crypto.randomUUID(), completed: false }],
        })),
      [],
    ),
    addAppointment: useCallback(
      (a: Omit<Appointment, "id" | "completed">) =>
        setData((d) => ({
          ...d,
          appointments: [
            ...d.appointments,
            { ...a, id: crypto.randomUUID(), completed: false },
          ],
        })),
      [],
    ),
    toggleAppointment: useCallback(
      (id: string) =>
        setData((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id ? { ...a, completed: !a.completed } : a,
          ),
        })),
      [],
    ),
    deleteAppointment: useCallback(
      (id: string) =>
        setData((d) => ({ ...d, appointments: d.appointments.filter((a) => a.id !== id) })),
      [],
    ),
    addVaccine: useCallback(
      (v: Omit<Vaccine, "id">) =>
        setData((d) => ({ ...d, vaccines: [...d.vaccines, { ...v, id: crypto.randomUUID() }] })),
      [],
    ),
    deleteVaccine: useCallback(
      (id: string) =>
        setData((d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) })),
      [],
    ),
  };
}

export function calcAge(birthDate: string) {
  if (!birthDate) return "";
  const b = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${months} ${months === 1 ? "mês" : "meses"}`;
  return `${years} ${years === 1 ? "ano" : "anos"}${months ? ` e ${months}m` : ""}`;
}

export function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null;
  const target = new Date(dateIso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

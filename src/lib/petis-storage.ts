import { useCallback, useEffect, useState } from "react";

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string; // ISO
  gender?: "Macho" | "Fêmea" | "";
  photo?: string;
  notes?: string;
  weights: { date: string; kg: number }[];
  photos: string[];
};

export type Task = {
  id: string;
  petId: string;
  title: string;
  date: string;
  time?: string;
  recurring: "once" | "daily";
  completed: boolean;
  completedDates?: string[];
};

export type Appointment = {
  id: string;
  petId: string;
  type: "Banho/Tosa" | "Consulta" | "Vacina" | "Medicação" | "Passeio";
  date: string;
  time: string;
  notes?: string;
  completed: boolean;
};

export type Vaccine = {
  id: string;
  petId: string;
  name: string;
  appliedDate: string;
  nextDate?: string;
  fileName?: string;
  fileData?: string;
};

export type PetisData = {
  pets: Pet[];
  activePetId: string | null;
  tasks: Task[];
  appointments: Appointment[];
  vaccines: Vaccine[];
};

const KEY = "petis-data-v2";
const AUTH_KEY = "petis:auth";

const today = () => new Date().toISOString().slice(0, 10);

function seed(): PetisData {
  return { pets: [], activePetId: null, tasks: [], appointments: [], vaccines: [] };
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
    // Trigger an initial re-render after mount to pick up real localStorage
    force((n) => n + 1);
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
      (petId: string, kg: number, date?: string) =>
        setData((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId
              ? { ...p, weights: [...p.weights, { date: date ?? today(), kg }] }
              : p,
          ),
        })),
      [],
    ),
    deleteWeight: useCallback(
      (petId: string, idx: number) =>
        setData((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId ? { ...p, weights: p.weights.filter((_, i) => i !== idx) } : p,
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
      (id: string, dateIso?: string) =>
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((t) => {
            if (t.id !== id) return t;
            if (t.recurring === "daily") {
              const day = dateIso ?? today();
              const set = new Set(t.completedDates ?? []);
              if (set.has(day)) set.delete(day);
              else set.add(day);
              return { ...t, completedDates: Array.from(set) };
            }
            return { ...t, completed: !t.completed };
          }),
        })),
      [],
    ),
    addTask: useCallback(
      (t: Omit<Task, "id" | "completed" | "completedDates">) =>
        setData((d) => ({
          ...d,
          tasks: [
            ...d.tasks,
            { ...t, id: crypto.randomUUID(), completed: false, completedDates: [] },
          ],
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

/* ============ Auth (local, mock) ============ */
export type AuthUser = { name: string; email: string; password: string; loggedIn: boolean };

const authListeners = new Set<() => void>();

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function setAuth(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
  authListeners.forEach((l) => l());
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const l = () => setUser(getAuth());
    authListeners.add(l);
    return () => {
      authListeners.delete(l);
    };
  }, []);
  return {
    user,
    register: (name: string, email: string, password: string) => {
      const u: AuthUser = { name, email, password, loggedIn: true };
      setAuth(u);
    },
    login: (email: string, password: string) => {
      const existing = getAuth();
      if (!existing || existing.email !== email || existing.password !== password) {
        return false;
      }
      setAuth({ ...existing, loggedIn: true });
      return true;
    },
    logout: () => {
      const existing = getAuth();
      if (existing) setAuth({ ...existing, loggedIn: false });
    },
  };
}

/* ============ Dark mode ============ */
const THEME_KEY = "petis:theme";
export function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

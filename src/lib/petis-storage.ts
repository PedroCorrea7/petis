import { useCallback, useEffect, useState } from "react";

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  gender?: "Macho" | "Fêmea" | "";
  photo?: string;
  notes?: string;
  weights: { date: string; kg: number }[];
  photos: string[];
  owner: string;
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

/* ============ Storage keys (per user, prefixed by email) ============ */
const AUTH_KEY = "petis:auth"; // currently logged user object
const USERS_KEY = "petis:users"; // all registered users with credentials

const petsKey = (email: string) => `petis:pets:${email}`;
const tasksKey = (email: string) => `petis:tasks:${email}`;
const apptsKey = (email: string) => `petis:appointments:${email}`;
const vaccinesKey = (email: string) => `petis:vaccines:${email}`;
const activePetKey = (email: string) => `petis:activePet:${email}`;

const today = () => new Date().toISOString().slice(0, 10);

/* ============ Auth session helpers ============ */
function readAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
function writeAuth(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

function getLoggedEmail(): string | null {
  return readAuth()?.email ?? null;
}

/* ============ Per-user data load / save (no global cache) ============ */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadData(email: string): PetisData {
  if (typeof window === "undefined") {
    return { pets: [], activePetId: null, tasks: [], appointments: [], vaccines: [] };
  }
  return {
    pets: safeParse<Pet[]>(localStorage.getItem(petsKey(email)), []),
    tasks: safeParse<Task[]>(localStorage.getItem(tasksKey(email)), []),
    appointments: safeParse<Appointment[]>(localStorage.getItem(apptsKey(email)), []),
    vaccines: safeParse<Vaccine[]>(localStorage.getItem(vaccinesKey(email)), []),
    activePetId: safeParse<string | null>(localStorage.getItem(activePetKey(email)), null),
  };
}

function saveData(email: string, data: PetisData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(petsKey(email), JSON.stringify(data.pets));
  localStorage.setItem(tasksKey(email), JSON.stringify(data.tasks));
  localStorage.setItem(apptsKey(email), JSON.stringify(data.appointments));
  localStorage.setItem(vaccinesKey(email), JSON.stringify(data.vaccines));
  localStorage.setItem(activePetKey(email), JSON.stringify(data.activePetId));
}

const dataListeners = new Set<() => void>();
const authListeners = new Set<() => void>();

function notifyData() {
  dataListeners.forEach((l) => l());
}
function notifyAuth() {
  authListeners.forEach((l) => l());
  notifyData(); // data is scoped to auth, refresh consumers too
}

function mutate(updater: (d: PetisData) => PetisData) {
  const email = getLoggedEmail();
  if (!email) return;
  const next = updater(loadData(email));
  saveData(email, next);
  notifyData();
}

/* ============ usePetis hook ============ */
export function usePetis() {
  const auth = useAuth();
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    dataListeners.add(l);
    return () => {
      dataListeners.delete(l);
    };
  }, []);

  // Force re-derive when user changes
  useEffect(() => {
    force((n) => n + 1);
  }, [auth.user?.email]);

  const email = auth.user?.email ?? null;
  const data: PetisData = email
    ? loadData(email)
    : { pets: [], activePetId: null, tasks: [], appointments: [], vaccines: [] };
  const activePet = data.pets.find((p) => p.id === data.activePetId) ?? data.pets[0] ?? null;

  return {
    data,
    activePet,
    setActivePet: useCallback(
      (id: string) => mutate((d) => ({ ...d, activePetId: id })),
      [],
    ),
    addPet: useCallback(
      (pet: Omit<Pet, "id" | "weights" | "photos" | "owner">) => {
        const ownerEmail = getLoggedEmail();
        if (!ownerEmail) return;
        mutate((d) => {
          const newPet: Pet = {
            ...pet,
            id: crypto.randomUUID(),
            weights: [],
            photos: [],
            owner: ownerEmail,
          };
          return { ...d, pets: [...d.pets, newPet], activePetId: newPet.id };
        });
      },
      [],
    ),
    updatePet: useCallback(
      (id: string, patch: Partial<Pet>) =>
        mutate((d) => ({
          ...d,
          pets: d.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      [],
    ),
    deletePet: useCallback(
      (id: string) =>
        mutate((d) => {
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
        mutate((d) => ({
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
        mutate((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId ? { ...p, weights: p.weights.filter((_, i) => i !== idx) } : p,
          ),
        })),
      [],
    ),
    addPhoto: useCallback(
      (petId: string, dataUrl: string) =>
        mutate((d) => ({
          ...d,
          pets: d.pets.map((p) =>
            p.id === petId ? { ...p, photos: [dataUrl, ...p.photos] } : p,
          ),
        })),
      [],
    ),
    toggleTask: useCallback(
      (id: string, dateIso?: string) =>
        mutate((d) => ({
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
        mutate((d) => ({
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
        mutate((d) => ({
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
        mutate((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id ? { ...a, completed: !a.completed } : a,
          ),
        })),
      [],
    ),
    deleteAppointment: useCallback(
      (id: string) =>
        mutate((d) => ({ ...d, appointments: d.appointments.filter((a) => a.id !== id) })),
      [],
    ),
    addVaccine: useCallback(
      (v: Omit<Vaccine, "id">) =>
        mutate((d) => ({
          ...d,
          vaccines: [...d.vaccines, { ...v, id: crypto.randomUUID() }],
        })),
      [],
    ),
    deleteVaccine: useCallback(
      (id: string) =>
        mutate((d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) })),
      [],
    ),
  };
}

/* ============ Date helpers ============ */
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

/* ============ Auth (local, multi-user) ============ */
export type AuthUser = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photo?: string;
};

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "no-email" | "wrong-password" };

export type RegisterResult = { ok: true } | { ok: false; reason: "exists" };

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  return safeParse<AuthUser[]>(localStorage.getItem(USERS_KEY), []);
}
function writeUsers(u: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export function getAuth(): AuthUser | null {
  return readAuth();
}

export function hasRegisteredUsers(): boolean {
  return readUsers().length > 0;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    const sync = () => setUser(readAuth());
    sync();
    authListeners.add(sync);
    return () => {
      authListeners.delete(sync);
    };
  }, []);
  return {
    user,
    register(data: AuthUser): RegisterResult {
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, reason: "exists" };
      }
      writeUsers([...users, data]);
      writeAuth(data);
      notifyAuth();
      return { ok: true };
    },
    login(email: string, password: string): LoginResult {
      const users = readUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return { ok: false, reason: "no-email" };
      if (found.password !== password) return { ok: false, reason: "wrong-password" };
      writeAuth(found);
      notifyAuth();
      return { ok: true };
    },
    logout() {
      writeAuth(null);
      notifyAuth();
    },
    updateUser(patch: Partial<AuthUser>) {
      const current = readAuth();
      if (!current) return;
      const oldEmail = current.email;
      const newEmail = patch.email ?? oldEmail;

      // Migrate per-user data keys if email changed
      if (newEmail.toLowerCase() !== oldEmail.toLowerCase()) {
        const data = loadData(oldEmail);
        saveData(newEmail, data);
        [petsKey, tasksKey, apptsKey, vaccinesKey, activePetKey].forEach((k) =>
          localStorage.removeItem(k(oldEmail)),
        );
      }

      const updatedUser: AuthUser = { ...current, ...patch };
      const users = readUsers().map((u) =>
        u.email.toLowerCase() === oldEmail.toLowerCase() ? updatedUser : u,
      );
      writeUsers(users);
      writeAuth(updatedUser);
      notifyAuth();
    },
  };
}

/* ============ Phone mask ============ */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
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

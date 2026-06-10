import type { Pet } from "@/lib/petis-storage";

export function PetAvatar({ pet, size = 48 }: { pet: Pet | null; size?: number }) {
  const style = { width: size, height: size };
  if (!pet) {
    return (
      <div
        style={style}
        className="grid shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"
        aria-hidden
      >
        🐾
      </div>
    );
  }
  if (pet.photo) {
    return (
      <img
        src={pet.photo}
        alt={`Foto de ${pet.name}`}
        style={style}
        className="shrink-0 rounded-full border-2 border-card object-cover shadow-sm"
      />
    );
  }
  const emoji = pet.species.toLowerCase().includes("gat") ? "🐱" : "🐶";
  return (
    <div
      style={{ ...style, fontSize: size * 0.55 }}
      className="grid shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-sm"
      aria-label={`Avatar de ${pet.name}`}
    >
      {emoji}
    </div>
  );
}

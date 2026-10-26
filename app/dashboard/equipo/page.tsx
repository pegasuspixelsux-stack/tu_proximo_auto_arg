import TeamManager from "../TeamManager";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default function EquipoPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          Usuarios &amp; Equipo
        </h1>
        <p className="mt-2 text-sm text-muted">
          Quién tiene acceso al panel y con qué rol
        </p>
      </header>
      <TeamManager />
    </main>
  );
}

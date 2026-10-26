import LeadsBoard from "../LeadsBoard";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default function LeadsPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          Interesados
        </h1>
        <p className="mt-2 text-sm text-muted">
          Pipeline de seguimiento: mové a cada interesado por etapa a medida que lo
          llamás o le escribís
        </p>
      </header>
      <LeadsBoard />
    </main>
  );
}

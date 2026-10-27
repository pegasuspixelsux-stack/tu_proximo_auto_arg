"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-4 py-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

export default function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      await signInWithEmailAndPassword(
        auth,
        String(data.get("email")),
        String(data.get("password")),
      );
      router.push("/dashboard");
    } catch {
      setError("Email o contraseña incorrectos.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="login-form"
      className="mt-10 space-y-5"
    >
      <div>
        <label
          htmlFor={emailId}
          className="text-xs font-medium uppercase tracking-widest text-muted"
        >
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@tuproximoauto.com"
          className={`${FIELD} mt-2`}
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="text-xs font-medium uppercase tracking-widest text-muted"
        >
          Contraseña
        </label>
        <div className="relative mt-2">
          <input
            id={passwordId}
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${FIELD} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={show}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:text-fg"
          >
            {show ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-muted">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 accent-[var(--inverse)]"
          />
          Recordarme
        </label>
        <a
          href="#"
          className="text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        data-testid="login-submit"
        className="w-full rounded-full bg-inverse px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar al Panel"}
      </button>
    </form>
  );
}

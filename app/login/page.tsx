"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to dashboard (or the original redirect target)
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/dashboard";
    window.location.href = redirectTo;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl text-primary-900">
            WhatsApp Lead Platform
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Inicia sesion para acceder al dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
              placeholder="admin@manuelsolis.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesion"}
          </button>
        </form>
      </div>
    </div>
  );
}

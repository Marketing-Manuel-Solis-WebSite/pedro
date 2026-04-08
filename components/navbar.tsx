"use client";

import { useState } from "react";
import Link from "next/link";
import { offices } from "@/lib/config/offices";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Firm Name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl text-primary-900 sm:text-2xl">
            {firmName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Offices dropdown */}
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary-700 transition-colors"
            >
              Oficinas
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-56 rounded-lg bg-white p-2 shadow-lg ring-1 ring-surface-border">
                {offices.map((office) => (
                  <Link
                    key={office.slug}
                    href={`/${office.slug}`}
                    className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-primary-700 transition-colors"
                  >
                    {office.city}, {office.stateCode}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="#servicios" className="text-sm font-medium text-text-secondary hover:text-primary-700 transition-colors">
            Servicios
          </Link>
          <Link href="#opiniones" className="text-sm font-medium text-text-secondary hover:text-primary-700 transition-colors">
            Opiniones
          </Link>

          <a
            href={`tel:${offices[0].phone}`}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Llamar ahora
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-surface-border bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-2">
            <p className="px-3 pt-2 text-xs font-semibold uppercase text-text-tertiary">Oficinas</p>
            {offices.map((office) => (
              <Link
                key={office.slug}
                href={`/${office.slug}`}
                className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted"
                onClick={() => setMobileOpen(false)}
              >
                {office.city}, {office.stateCode}
              </Link>
            ))}
            <Link href="#servicios" className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted" onClick={() => setMobileOpen(false)}>
              Servicios
            </Link>
            <Link href="#opiniones" className="rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted" onClick={() => setMobileOpen(false)}>
              Opiniones
            </Link>
            <a
              href={`tel:${offices[0].phone}`}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { offices } from "@/lib/config/offices";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

interface FooterProps {
  language?: "es" | "en";
}

export function Footer({ language = "es" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-border bg-primary-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="font-display text-lg text-white">{firmName}</span>
            <p className="mt-3 text-sm leading-relaxed text-primary-300">
              {language === "en"
                ? "Immigration law firm with offices in Texas, Illinois, Colorado, and Tennessee."
                : "Despacho de abogados de inmigración con oficinas en Texas, Illinois, Colorado y Tennessee."}
            </p>
          </div>

          {/* Offices */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              {language === "en" ? "Offices" : "Oficinas"}
            </h4>
            <ul className="mt-3 space-y-2">
              {offices.map((office) => (
                <li key={office.slug}>
                  <Link
                    href={`/${office.slug}`}
                    className="text-sm text-primary-300 hover:text-white transition-colors"
                  >
                    {office.city}, {office.stateCode}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              Legal
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={language === "en" ? "/privacy" : "/privacidad"}
                  className="text-sm text-primary-300 hover:text-white transition-colors"
                >
                  {language === "en" ? "Privacy Policy" : "Aviso de Privacidad"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              {language === "en" ? "Contact" : "Contacto"}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`tel:${offices[0].phone}`}
                  className="text-sm text-primary-300 hover:text-white transition-colors"
                >
                  {offices[0].phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-800 pt-6">
          <p className="text-center text-xs text-primary-400">
            &copy; {currentYear} {firmName}.{" "}
            {language === "en" ? "All rights reserved." : "Todos los derechos reservados."}
          </p>
        </div>
      </div>
    </footer>
  );
}

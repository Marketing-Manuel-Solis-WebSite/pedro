import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
};

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-primary-900 sm:text-4xl">
          Aviso de Privacidad
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">Versión: privacy-es-v1.0 | Última actualización: abril 2026</p>

        <div className="prose prose-sm mt-8 max-w-none text-text-secondary [&_h2]:font-display [&_h2]:text-primary-900 [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5">
          <h2>1. Responsable del tratamiento</h2>
          <p>{firmName} (en adelante, &ldquo;la Firma&rdquo;) es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y las leyes aplicables en los Estados Unidos.</p>

          <h2>2. Datos personales que recabamos</h2>
          <p>A través de nuestro sitio web y del servicio de mensajería WhatsApp, podemos recabar:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Número de teléfono</li>
            <li>Ciudad de residencia</li>
            <li>Descripción general de su consulta de inmigración</li>
            <li>Dirección IP y tipo de dispositivo</li>
            <li>Datos de navegación (cookies, URL de origen)</li>
          </ul>
          <p><strong>No recabamos</strong> en el primer contacto: identificaciones oficiales, números de seguro social, información financiera, información médica, ni números de caso migratorio.</p>

          <h2>3. Finalidades del tratamiento</h2>
          <ul>
            <li>Atender su consulta inicial de inmigración</li>
            <li>Canalizarle con el abogado o la oficina correspondiente</li>
            <li>Dar seguimiento a su solicitud</li>
            <li>Mejorar nuestros servicios</li>
          </ul>

          <h2>4. Consentimiento</h2>
          <p>Al hacer clic en &ldquo;Escríbenos por WhatsApp&rdquo; y enviar un mensaje, usted otorga su consentimiento expreso para que le respondamos por WhatsApp con el fin de atender su solicitud. Este consentimiento queda registrado con marca de tiempo, la URL de origen, y el texto legal que se le mostró.</p>

          <h2>5. Ejercicio de derechos ARCO</h2>
          <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, envíe un mensaje con la palabra &ldquo;BAJA&rdquo; por WhatsApp o comuníquese con nosotros directamente.</p>

          <h2>6. Revocación del consentimiento</h2>
          <p>Puede revocar su consentimiento en cualquier momento enviando la palabra &ldquo;BAJA&rdquo; por WhatsApp. La revocación será procesada de inmediato y no recibirá más mensajes automatizados.</p>

          <h2>7. Seguridad de los datos</h2>
          <p>Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.</p>

          <h2>8. Cambios al aviso de privacidad</h2>
          <p>Nos reservamos el derecho de modificar este aviso. Cualquier cambio será publicado en esta página con una nueva versión y fecha de actualización.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { ServicesGrid } from "@/components/services-grid";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { OfficesMap } from "@/components/offices-map";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { offices, getOfficeBySlug } from "@/lib/config/offices";

interface OfficePageProps {
  params: Promise<{ "office-slug": string }>;
}

export async function generateStaticParams() {
  return offices.map((office) => ({
    "office-slug": office.slug,
  }));
}

export async function generateMetadata({
  params,
}: OfficePageProps): Promise<Metadata> {
  const { "office-slug": slug } = await params;
  const office = getOfficeBySlug(slug);
  if (!office) return {};

  return {
    title: `Abogados de Inmigración en ${office.city}, ${office.stateCode}`,
    description: `Consulta gratis con abogados de inmigración en ${office.city}, ${office.state}. Atención por WhatsApp, rápida y confidencial.`,
  };
}

export default async function OfficePage({ params }: OfficePageProps) {
  const { "office-slug": slug } = await params;
  const office = getOfficeBySlug(slug);

  if (!office) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero office={office} />
        <TrustBar />
        <ServicesGrid />
        <ReviewsCarousel />
        <OfficesMap />
      </main>
      <Footer />
      <FloatingWhatsApp
        officePhone={office.whatsappPhone}
        officeName={office.name}
        officeSlug={office.slug}
        prefilledMessage={`Hola, me gustaría una consulta de la oficina de ${office.city}.`}
      />
    </>
  );
}

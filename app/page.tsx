import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { ServicesGrid } from "@/components/services-grid";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { OfficesMap } from "@/components/offices-map";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { defaultOffice } from "@/lib/config/offices";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero office={defaultOffice} />
        <TrustBar />
        <ServicesGrid />
        <ReviewsCarousel />
        <OfficesMap />
      </main>
      <Footer />
      <FloatingWhatsApp
        officePhone={defaultOffice.whatsappPhone}
        officeName={defaultOffice.name}
        officeSlug={defaultOffice.slug}
        prefilledMessage={`Hola, me gustaría una consulta de la oficina de ${defaultOffice.city}.`}
      />
    </>
  );
}

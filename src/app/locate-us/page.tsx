import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/locate-us/ContactForm";
import StoreMapWrapper from "@/components/locate-us/StoreMapWrapper";

interface StoreData {
  id: number;
  name: string;
  address: string;
  unit: string;
  building: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  grabUrl: string | null;
  foodpandaUrl: string | null;
}

async function getStores(): Promise<StoreData[]> {
  try {
    return await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export const revalidate = 300; // revalidate every 5 minutes

export const metadata = {
  title: "Locate Us",
  description:
    "Find an Otter Pizza near you. Multiple locations across Singapore. Order delivery via Grab or Foodpanda.",
};

export default async function LocateUsPage() {
  const stores = await getStores();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-cream/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-lg">📍</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
            Locate Us
          </h1>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Find your nearest Otter Pizza and order delivery straight to your door.
          </p>
        </div>

        {/* Leaflet Map — 640px, grey/white tiles, logo markers */}
        <div className="mb-12">
          <StoreMapWrapper
            stores={stores
              .filter((s) => s.latitude != null && s.longitude != null)
              .map((s) => ({
                id: s.id,
                name: s.name,
                latitude: s.latitude!,
                longitude: s.longitude!,
                address: s.address,
                unit: s.unit,
                building: s.building,
                postalCode: s.postalCode,
              }))}
          />
        </div>

        {/* Store cards grid — 4 columns */}
        {stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30 max-lg:flex max-lg:items-center max-lg:justify-between max-lg:gap-3 max-lg:p-3"
              >
                <div className="max-lg:min-w-0 max-lg:flex-1">
                  <h3 className="text-sm font-bold text-dark truncate">
                    Otter Pizza | {store.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed max-lg:truncate max-lg:mt-0.5">
                    {store.address}
                    {store.unit && <>, {store.unit}</>}
                    <span className="max-lg:hidden">
                      <br />
                      {store.building}
                      <br />
                      S{store.postalCode}
                    </span>
                    <span className="hidden max-lg:inline">
                      , {store.building}, S{store.postalCode}
                    </span>
                  </p>
                </div>

                {/* Delivery platform buttons */}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 max-lg:mt-0 max-lg:pt-0 max-lg:border-t-0 max-lg:shrink-0">
                  {store.grabUrl ? (
                    <a
                      href={store.grabUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-[#00B14F] px-3 py-1 text-xs font-semibold text-white hover:bg-[#009A3F] transition-colors"
                      aria-label={`Order ${store.name} on Grab`}
                    >
                      Grab
                    </a>
                  ) : null}
                  {store.foodpandaUrl ? (
                    <a
                      href={store.foodpandaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-[#FF2B85] px-3 py-1 text-xs font-semibold text-white hover:bg-[#E51A70] transition-colors"
                      aria-label={`Order ${store.name} on Foodpanda`}
                    >
                      Foodpanda
                    </a>
                  ) : null}
                  {!store.grabUrl && !store.foodpandaUrl && (
                    <span className="text-[10px] text-muted/60">
                      Order via website
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MapPin className="mx-auto h-12 w-12 text-muted/30" />
            <p className="mt-4 text-muted text-lg">
              No stores available at the moment.
            </p>
          </div>
        )}

        {/* Contact form section */}
        <section id="contact" className="mt-20 pt-12 border-t border-gold/30">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-primary/30" />
                <span className="text-primary text-lg">💬</span>
                <div className="h-px w-8 bg-primary/30" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-dark">
                Get In Touch
              </h2>
              <p className="mt-3 text-muted">
                Have a question, feedback, or just want to say hi? Drop us a message!
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm ring-1 ring-primary/5">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

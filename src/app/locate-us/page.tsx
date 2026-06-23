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
                className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30"
              >
                <h3 className="text-sm font-bold text-dark truncate">
                  {store.name}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {store.address}
                  {store.unit && <>, {store.unit}</>}
                  <br />
                  {store.building}
                  <br />
                  S{store.postalCode}
                </p>

                {/* Delivery platform buttons */}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  {store.grabUrl ? (
                    <a
                      href={store.grabUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-[#00B14F] px-3 py-1 text-xs font-semibold text-white hover:bg-[#009A3F] transition-colors"
                      aria-label={`Order ${store.name} on Grab`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 7H14v4h-2V9h-1.5l2.5-2.5L15.5 9zM10 15H8.5l-2.5-2.5L8.5 10H10v5z" />
                      </svg>
                      Grab
                    </a>
                  ) : null}
                  {store.foodpandaUrl ? (
                    <a
                      href={store.foodpandaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-[#FF2B85] px-3 py-1 text-xs font-semibold text-white hover:bg-[#E51A70] transition-colors"
                      aria-label={`Order ${store.name} on Foodpanda`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
                      </svg>
                      Foodpanda
                    </a>
                  ) : null}
                  {!store.grabUrl && !store.foodpandaUrl && (
                    <span className="text-[10px] text-muted/50 italic">
                      Coming soon
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

import { MapPin, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/locate-us/ContactForm";

interface StoreData {
  id: number;
  name: string;
  address: string;
  unit: string;
  building: string;
  postalCode: string;
  grabUrl: string | null;
  foodpandaUrl: string | null;
  deliverooUrl: string | null;
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
    "Find an Otter Pizza near you. Multiple locations across Singapore. Order delivery via Grab, Foodpanda, or Deliveroo.",
};

export default async function LocateUsPage() {
  const stores = await getStores();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight">
            Locate Us
          </h1>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            Find your nearest Otter Pizza and order delivery straight to your door.
          </p>
        </div>

        {/* Store cards grid */}
        {stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-dark">
                      {store.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted leading-relaxed">
                      {store.address}
                      <br />
                      {store.unit && <>{store.unit}, </>}
                      {store.building}
                      <br />
                      Singapore {store.postalCode}
                    </p>
                  </div>
                </div>

                {/* Delivery platform buttons */}
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Order on
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {store.grabUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={store.grabUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Grab
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {store.foodpandaUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={store.foodpandaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Foodpanda
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {store.deliverooUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={store.deliverooUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Deliveroo
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {!store.grabUrl &&
                      !store.foodpandaUrl &&
                      !store.deliverooUrl && (
                        <span className="text-xs text-muted/60 italic">
                          Coming soon
                        </span>
                      )}
                  </div>
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
        <section
          id="contact"
          className="mt-20 pt-12 border-t border-border"
        >
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-dark">
                Get In Touch
              </h2>
              <p className="mt-3 text-muted">
                Have a question, feedback, or just want to say hi? Drop us a message!
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

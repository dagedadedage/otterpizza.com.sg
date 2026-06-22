import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "Menu", href: "/menu" },
      { label: "Order Online", href: "/order" },
      { label: "Locate Us", href: "/locate-us" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "/locate-us#contact" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-dark text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
              OTTER PIZZA
            </Link>
            <p className="mt-3 text-sm text-cream/70 leading-relaxed">
              Singapore&apos;s neighbourhood pizzeria. Fresh, handcrafted pizzas made with love.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-cream/60">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Multiple locations across Singapore
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                +65 1234 5678
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                hello@otterpizza.com.sg
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Daily: 11:00 AM - 10:00 PM
              </span>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-cream tracking-wider uppercase">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Opening hours */}
          <div>
            <h3 className="text-sm font-semibold text-cream tracking-wider uppercase">
              Opening Hours
            </h3>
            <dl className="mt-4 space-y-2 text-sm text-cream/60">
              <div className="flex justify-between">
                <dt>Monday - Friday</dt>
                <dd>11:00 AM - 10:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday</dt>
                <dd>10:00 AM - 11:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd>11:00 AM - 10:00 PM</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-cream/10 text-center text-xs text-cream/40">
          &copy; {new Date().getFullYear()} Otter Pizza. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

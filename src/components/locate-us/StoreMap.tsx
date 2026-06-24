"use client";

import { useEffect, useRef } from "react";

interface StoreLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  unit: string;
  building: string;
  postalCode: string;
}

interface StoreMapProps {
  stores: StoreLocation[];
}

export default function StoreMap({ stores }: StoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (cancelled || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Clean up previous
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Singapore centre
      const center: [number, number] = [1.3521, 103.8198];

      mapRef.current = L.map(mapContainerRef.current, {
        center,
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      // Light tile style similar to Google Maps
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(mapRef.current);

      // Custom Otter Merlion marker icon
      const merlionIcon = L.icon({
        iconUrl: "/images/otter-merlion.png",
        iconSize: [40, 49],
        iconAnchor: [20, 49],
        popupAnchor: [0, -52],
      });

      // Add markers with store name labels
      const validStores = stores.filter(
        (s) => s.latitude != null && s.longitude != null
      );

      const newMarkers = validStores.map((store) => {
        const displayName = `Otter Pizza | ${store.name}`;

        const marker = L.marker([store.latitude, store.longitude], {
          icon: merlionIcon,
        }).addTo(mapRef.current!);

        // Permanent label beside marker showing store name
        marker.bindTooltip(store.name, {
          permanent: true,
          direction: "right",
          offset: [8, -20],
          className: "store-marker-label",
        });

        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
          `Otter Pizza ${store.name} Singapore`
        )}`;

        marker.bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:200px">
            <strong style="font-size:14px;color:#E85D2C">${displayName}</strong><br/>
            <span style="font-size:12px;color:#555">${store.address}${
            store.unit ? ", " + store.unit : ""
          }<br/>${store.building}<br/>S${store.postalCode}</span>
            <br/>
            <a href="${mapsUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-size:12px;color:#E85D2C;text-decoration:none;font-weight:600;border:1px solid #E85D2C;border-radius:20px;padding:3px 12px;">📍 Open in Google Maps</a>
          </div>`
        );

        return marker;
      });

      markersRef.current = newMarkers;

      // Fit bounds to show all markers, or default to Singapore view
      if (validStores.length > 0) {
        const bounds = L.latLngBounds(
          validStores.map((s) => [s.latitude, s.longitude] as [number, number])
        );
        mapRef.current.fitBounds(bounds.pad(0.15));
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [stores]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-xl overflow-hidden border-2 border-primary/15 shadow-md ring-1 ring-gold/20 h-[320px] lg:h-[640px] relative z-0"
    />
  );
}

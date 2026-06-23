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

      // Singapore center
      const center: [number, number] = [1.3521, 103.8198];

      // Grey/white tile style — CartoDB light
      mapRef.current = L.map(mapContainerRef.current, {
        center,
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(mapRef.current);

      // Custom Otter Merlion marker icon (237x290 scaled to 40x49)
      const merlionIcon = L.icon({
        iconUrl: "/images/otter-merlion.png",
        iconSize: [40, 49],
        iconAnchor: [20, 49], // bottom center
        popupAnchor: [0, -52],
      });

      // Add markers
      const validStores = stores.filter(
        (s) => s.latitude != null && s.longitude != null
      );

      const newMarkers = validStores.map((store) => {
        const marker = L.marker([store.latitude, store.longitude], {
          icon: merlionIcon,
        }).addTo(mapRef.current!);

        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`Otter Pizza ${store.name} Singapore`)}`;

        marker.bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:180px">
            <strong style="font-size:14px;color:#E85D2C">${store.name}</strong><br/>
            <span style="font-size:12px;color:#666">${store.address}${store.unit ? ", " + store.unit : ""}<br/>${store.building}<br/>S${store.postalCode}</span>
            <br/>
            <a href="${mapsUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-size:12px;color:#E85D2C;text-decoration:none;font-weight:600;border:1px solid #E85D2C;border-radius:20px;padding:3px 10px;">📍 Open in Google Maps</a>
          </div>`
        );

        return marker;
      });

      markersRef.current = newMarkers;

      // Fit bounds to show all markers
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
      className="w-full rounded-xl overflow-hidden border-2 border-primary/15 shadow-md ring-1 ring-gold/20 h-[320px] lg:h-[640px]"
    />
  );
}

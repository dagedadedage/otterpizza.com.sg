"use client";

import dynamic from "next/dynamic";

const StoreMap = dynamic(() => import("@/components/locate-us/StoreMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-xl overflow-hidden border-2 border-primary/15 shadow-md ring-1 ring-gold/20 bg-muted/10 flex items-center justify-center"
      style={{ height: "640px" }}
    >
      <p className="text-muted">Loading map…</p>
    </div>
  ),
});

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

interface StoreMapWrapperProps {
  stores: StoreLocation[];
}

export default function StoreMapWrapper({ stores }: StoreMapWrapperProps) {
  return <StoreMap stores={stores} />;
}

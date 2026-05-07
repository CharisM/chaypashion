"use client";

import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiLoader } from "react-icons/fi";

interface DeliveryMapProps {
  address: string;
}

export default function DeliveryMap({ address }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "found" | "error">("loading");

  useEffect(() => {
    if (!address || !mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      // Dynamically import leaflet (SSR safe)
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Geocode address using Nominatim (free, no API key)
      const query = encodeURIComponent(`${address}, Philippines`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
      const data = await res.json();

      if (cancelled) return;

      if (!data || data.length === 0) { setStatus("error"); return; }

      const { lat, lon, display_name } = data[0];
      const latlng: [number, number] = [parseFloat(lat), parseFloat(lon)];

      // Destroy previous map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView(latlng, 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker(latlng).addTo(map);
      marker.bindPopup(
        `<div style="font-size:12px;max-width:200px"><b>📦 Delivery Address</b><br/>${display_name}</div>`,
        { maxWidth: 220 }
      ).openPopup();

      setStatus("found");
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <FiMapPin className="text-[#c9a98a] shrink-0" />
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">Delivery Location</p>
      </div>
      <div className="relative">
        <div ref={mapRef} style={{ height: 220, width: "100%" }} />
        {status === "loading" && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
            <FiLoader className="text-gray-400 text-xl animate-spin" />
            <p className="text-xs text-gray-400">Loading map...</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
            <FiMapPin className="text-gray-300 text-2xl" />
            <p className="text-xs text-gray-400 text-center px-4">Could not locate address on map</p>
          </div>
        )}
      </div>
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 truncate">📍 {address}</p>
      </div>
    </div>
  );
}

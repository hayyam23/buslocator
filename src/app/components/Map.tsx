"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

let L!: typeof import("leaflet");

if (typeof window !== "undefined") {
  L = require("leaflet") as typeof import("leaflet");
}


if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface BusLocation {
  OtobusId: number;
  Yon: number;
  KoorY: string;
  KoorX: string;
}

interface MapProps {
  busLocations: BusLocation[];
}

const Map: React.FC<MapProps> = ({ busLocations }) => {
  const [busIcon, setBusIcon] = useState<L.Icon | null>(null);//const [busIcon, setBusIcon] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setBusIcon(
          new leaflet.Icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/635/635705.png",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
          })
        );
      });
    }
  }, []);

  const validBusLocations = busLocations
    .filter((bus) => bus.KoorX !== "0" && bus.KoorY !== "0")
    .map((bus) => ({
      ...bus,
      latitude: parseFloat(bus.KoorX.replace(",", ".")),
      longitude: parseFloat(bus.KoorY.replace(",", ".")),
    }));

  return (
    <MapContainer
      center={[38.48604, 27.056975]}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <AutoZoom busLocations={validBusLocations} />

      {busIcon &&
        validBusLocations.map((bus, index) => (
          <Marker
            key={`${bus.OtobusId}-${index}`}
            position={[bus.latitude, bus.longitude]}
            icon={busIcon}
          >
            <Popup>
              <strong>Otobüs ID:</strong> {bus.OtobusId} <br />
              <strong>Yön:</strong> {bus.Yon === 1 ? "Gidiş" : "Dönüş"}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;

// Otomatik zoom bileşeni
const AutoZoom: React.FC<{ busLocations: { latitude: number; longitude: number }[] }> = ({ busLocations }) => {
  const map = useMap();

  useEffect(() => {
    if (busLocations.length > 0) {
      const bounds = L.latLngBounds(busLocations.map(bus => [bus.latitude, bus.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [busLocations, map]);

  return null;
};

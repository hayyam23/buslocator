"use client";   /* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import Map from "./components/Map";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { Icon } from "leaflet";
// Define types for bus details and other data structures 
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
//const Polyline = dynamic(
//() => import("react-leaflet").then((mod) => mod.Polyline),
// { ssr: false }
//);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

//let L: any;
//if (typeof window !== "undefined") {
// L = require("leaflet");
//}



interface BusDetails {
  HAT_NO: string;
  TARIFE_ID: string;
  GIDIS_SAATI: string;
  DONUS_SAATI: string;
  SIRA: string;
}

interface AdditionalBusDetails {
  HAT_NO: string;
  BASLIK: string;
  BASLAMA_TARIHI: string;
  BITIS_TARIHI: string;
}

interface ExtraBusDetails {
  HAT_NO: string;
  HAT_ADI: string;
  GUZERGAH_ACIKLAMA: string;
  ACIKLAMA: string;
  HAT_BASLANGIC: string;
  HAT_BITIS: string;
}

interface BusLocation {
  OtobusId: number;
  Yon: number;
  KoorY: string;
  KoorX: string;
}

interface StationDetails {
  DURAK_ID: number;
  DURAK_ADI: string;
  ENLEM: string;
  BOYLAM: string;
  DURAKTAN_GECEN_HATLAR: string;
}

// Otobüs konumlarını getiren fonksiyon
async function fetchBusLocations(
  hatNo: string,
  setBusLocations: React.Dispatch<React.SetStateAction<BusLocation[]>>
) {
  if (!hatNo) return;
  try {
    const res = await fetch(
      `https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/${hatNo}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    console.log("Otobüs Konumları:", data.HatOtobusKonumlari);
    setBusLocations(data.HatOtobusKonumlari || []);
  } catch (error) {
    console.error("Otobüs konumları çekilirken hata oluştu:", error);
  }
}

// Otobüs detaylarını getiren fonksiyon
async function fetchBusDetails(
  setBusDetails: React.Dispatch<React.SetStateAction<BusDetails[]>>
) {
  try {
    const res = await fetch(
      "https://acikveri.bizizmir.com/tr/api/3/action/datastore_search?resource_id=c6fa6046-f755-47d7-b69e-db6bb06a8b5a&limit=50",
      { cache: "no-store" }
    );
    const data = await res.json();
    console.log("Otobüs Detayları:", data.result.records);
    setBusDetails(data.result.records || []);
  } catch (error) {
    console.error("Otobüs detayları çekilirken hata oluştu:", error);
  }
}

// Yeni verileri çeken fonksiyon
async function fetchAdditionalBusDetails(
  setAdditionalBusDetails: React.Dispatch<
    React.SetStateAction<AdditionalBusDetails[]>
  >
) {
  try {
    const res = await fetch(
      "https://acikveri.bizizmir.com/tr/api/3/action/datastore_search?resource_id=aeafda53-3db8-46fa-abe3-47b773fc8b90&limit=50",
      { cache: "no-store" }
    );
    const data = await res.json();
    console.log("Ek Otobüs Detayları:", data.result.records);
    setAdditionalBusDetails(data.result.records || []);
  } catch (error) {
    console.error("Ek otobüs detayları çekilirken hata oluştu:", error);
  }
}

// Yeni link için verileri çeken fonksiyon
async function fetchExtraBusDetails(
  setExtraBusDetails: React.Dispatch<React.SetStateAction<ExtraBusDetails[]>>
) {
  try {
    const res = await fetch(
      "https://acikveri.bizizmir.com/tr/api/3/action/datastore_search?resource_id=bd6c84f8-49ba-4cf4-81f8-81a0fbb5caa3&limit=5",
      { cache: "no-store" }
    );
    const data = await res.json();
    console.log("Ekstra Otobüs Detayları:", data.result.records);
    setExtraBusDetails(data.result.records || []);
  } catch (error) {
    console.error("Ekstra otobüs detayları çekilirken hata oluştu:", error);
  }
}

// Yeni durak verilerini çeken fonksiyon
async function fetchStationDetails(
  setStationDetails: React.Dispatch<React.SetStateAction<StationDetails[]>>
) {
  try {
    const res = await fetch(
      "https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id=0c791266-a2e4-4f14-82b8-9a9b102fbf94&limit=10",
      { cache: "no-store" }
    );
    const data = await res.json();
    console.log("Durak Detayları:", data.result.records);
    setStationDetails(data.result.records || []);
  } catch (error) {
    console.error("Durak detayları çekilirken hata oluştu:", error);
  }
}

export default function Home() {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [busDetails, setBusDetails] = useState<BusDetails[]>([]);
  const [busIcon, setBusIcon] = useState<Icon | undefined>(undefined);//any idi chanced to icon
  const mapRef = useRef(null as any); //const mapRef = useRef<any>(null);
  const [additionalBusDetails, setAdditionalBusDetails] = useState<
    AdditionalBusDetails[]

  >([]);
  const [extraBusDetails, setExtraBusDetails] = useState<ExtraBusDetails[]>([]);
  const [stationDetails, setStationDetails] = useState<StationDetails[]>([]);
  const [hatNo, setHatNo] = useState<string>("");
  const [busSearchTerm, setBusSearchTerm] = useState<string>(""); // Otobüs arama terimi
  const [additionalBusSearchTerm] =
    useState<string>(""); // Ek otobüs arama terimi
  const [extraBusSearchTerm, setExtraBusSearchTerm] = useState<string>(""); // Ekstra otobüs arama terimi
  const [stationSearchTerm, setStationSearchTerm] = useState<string>(""); // Durak arama terimi
  console.log(additionalBusDetails)
  console.log(additionalBusSearchTerm)
  // Otobüs detaylarını sayfa yüklendiğinde bir kere çek
  useEffect(() => {


    fetchBusDetails(setBusDetails);
    fetchAdditionalBusDetails(setAdditionalBusDetails); // Ek verileri çek
    fetchExtraBusDetails(setExtraBusDetails); // Yeni verileri çek
    fetchStationDetails(setStationDetails); // Durak verilerini çek 

    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        const busMarkerIcon = new leaflet.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        setBusIcon(busMarkerIcon);
      });
    }

  }, []);

  // Otobüs konumlarını sadece hatNo değiştiğinde çek
  useEffect(() => {
    fetchBusLocations(hatNo, setBusLocations);

  }, [hatNo]);

  // HAT_NO'ya göre filtreleme fonksiyonu
  const filteredBusDetails = busDetails.filter((bus) =>
    bus.HAT_NO.toString().includes(busSearchTerm)
  );

  // const filteredAdditionalBusDetails = additionalBusDetails.filter((bus) =>
  //   bus.HAT_NO.toString().includes(additionalBusSearchTerm)
  // );

  const filteredExtraBusDetails = extraBusDetails.filter((bus) =>
    bus.HAT_NO.toString().includes(extraBusSearchTerm)
  );

  const filteredStationDetails = stationDetails.filter((station) =>
    station.DURAK_ADI.toLowerCase().includes(stationSearchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      <h1>İzmir Otobüs Konumları ve Duraklar</h1>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Otobüs hattı numarasını girin"
          style={{ color: "black", padding: 8, borderRadius: 5 }}
          value={hatNo}
          onChange={(e) => setHatNo(e.target.value)}
        />
      </div>

      {/* Otobüs Konumları */}
      <Map busLocations={busLocations} />

      {/* Otobüs Detayları ve Ek Detaylar (Yan Yana) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 20,
        }}
      >
        {/* Otobüs Detayları */}
        <div
          style={{
            width: "23%",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Otobüs Detayları</h2>
          <input
            type="text"
            placeholder="Hat numarası ara"
            style={{
              padding: 8,
              borderRadius: 5,
              color: "black",
              marginBottom: 10,
            }}
            value={busSearchTerm}
            onChange={(e) => setBusSearchTerm(e.target.value)}
          />
          {filteredBusDetails.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            filteredBusDetails.map((bus, index) => (
              <div
                key={index}
                style={{ borderBottom: "1px solid gray", padding: 10 }}
              >
                <p>
                  <strong>Hat No:</strong> {bus.HAT_NO}
                </p>
                <p>
                  <strong>Tarife ID:</strong> {bus.TARIFE_ID}
                </p>
                <p>
                  <strong>Gidiş Saati:</strong> {bus.GIDIS_SAATI}
                </p>
                <p>
                  <strong>Dönüş Saati:</strong> {bus.DONUS_SAATI}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Ekstra Detaylar */}
        <div
          style={{
            width: "23%",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Ekstra Otobüs Detayları</h2>
          <input
            type="text"
            placeholder="Hat numarası ara"
            style={{
              padding: 8,
              borderRadius: 5,
              color: "black",
              marginBottom: 10,
            }}
            value={extraBusSearchTerm}
            onChange={(e) => setExtraBusSearchTerm(e.target.value)}
          />
          {filteredExtraBusDetails.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            filteredExtraBusDetails.map((bus, index) => (
              <div
                key={index}
                style={{ borderBottom: "1px solid gray", padding: 10 }}
              >
                <p>
                  <strong>Hat No:</strong> {bus.HAT_NO}
                </p>
                <p>
                  <strong>Hat Adı:</strong> {bus.HAT_ADI}
                </p>
                <p>
                  <strong>Güzergah Açıklama:</strong> {bus.GUZERGAH_ACIKLAMA}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Durak Detayları */}
        <div
          style={{
            width: "23%",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Durak Detayları</h2>
          <input
            type="text"
            placeholder="Durak adı ara"
            style={{
              padding: 8,
              borderRadius: 5,
              color: "black",
              marginBottom: 10,
            }}
            value={stationSearchTerm}
            onChange={(e) => setStationSearchTerm(e.target.value)}
          />
          {filteredStationDetails.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            filteredStationDetails.map((station, index) => (
              <div
                key={index}
                style={{ borderBottom: "1px solid gray", padding: 10 }}
              >
                <p>
                  <strong>Durak Adı:</strong> {station.DURAK_ADI}
                </p>
                <p>
                  <strong>Enlem:</strong> {station.ENLEM}
                </p>
                <p>
                  <strong>Boylam:</strong> {station.BOYLAM}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Ekstra Otobüs Detayları */}
        <div
          style={{
            width: "23%",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Ekstra Otobüs Detayları</h2>
          <input
            type="text"
            placeholder="Hat numarası ara"
            style={{
              padding: 8,
              borderRadius: 5,
              color: "black",
              marginBottom: 10,
            }}
            value={stationSearchTerm}
            onChange={(e) => setStationSearchTerm(e.target.value)}
          />
          {filteredStationDetails.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            filteredStationDetails.map((station, index) => (
              <div
                key={index}
                style={{
                  borderBottom: "1px solid gray",
                  padding: 10,
                }}
              >
                <p>
                  <strong>Durak Adı:</strong> {station.DURAK_ADI}
                </p>
                <p>
                  <strong>Enlem:</strong> {station.ENLEM}
                </p>
                <p>
                  <strong>Boylam:</strong> {station.BOYLAM}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
      <MapContainer
        center={[38.48604, 27.056975]}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
          attribution="Google Maps Traffic"
        />

        {stationDetails.map((stop) => (
          <Marker
            key={stop.DURAK_ID}
            position={[Number(stop.ENLEM), Number(stop.BOYLAM)]}
            icon={busIcon}
          >
            <Popup>
              <b>Durak Adı:</b> {stop.DURAK_ADI} <br />
              <b>Hat No:</b> {stop.DURAKTAN_GECEN_HATLAR} <br />
              <button onClick={() => alert("Favorilere Eklendi!")}>
                ⭐ Favorilere Ekle
              </button>
            </Popup>
          </Marker>
        ))}


      </MapContainer>
    </div>
  );
}




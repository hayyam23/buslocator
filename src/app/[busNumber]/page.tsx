"use client";

import React, { useEffect, useState } from "react";
import Map from "../components/Map";

interface BusLocation {
  OtobusId: number;
  Yon: number;
  KoorY: string;
  KoorX: string;
}

interface Props {
  params: Promise<{
    busNumber: string;
  }>;
}

interface BusSchedule {
  _id: number;
  HAT_NO: number;
  TARIFE_ID: number;
  GIDIS_SAATI: string;
  DONUS_SAATI: string;
  SIRA: number;
  GIDIS_ENGELLI_DESTEGI: string;
  DONUS_ENGELLI_DESTEGI: string;
  BISIKLETLI_GIDIS: string;
  BISIKLETLI_DONUS: string;
  GIDIS_ELEKTRIKLI_OTOBUS: string;
  DONUS_ELEKTRIKLI_OTOBUS: string;
}

const BusPage = ({ params }: Props) => {
  // `React.use` ile `params` Promise'ini çöz
  const { busNumber } = React.use(params);

  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busData, setBusData] = useState<BusSchedule | null>(null); // Otobüs verisini tutacak state

  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const res = await fetch(
          `https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/${busNumber}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Veri çekme hatası.");
        }

        const data = await res.json();
        setBusLocations(data.HatOtobusKonumlari || []);
        console.log("Otobüs Konumları:", data.HatOtobusKonumlari || []); // Terminalde görmek için log
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
        );
      }
    };

    fetchBusLocations();
  }, [busNumber]);

  // Otobüs verilerini çekme
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await fetch(
          "https://acikveri.bizizmir.com/tr/api/3/action/datastore_search?resource_id=c6fa6046-f755-47d7-b69e-db6bb06a8b5a&limit=50"
        );

        if (!res.ok) {
          throw new Error("Veri çekme hatası.");
        }

        const data = await res.json();
        setBusData(data.result.records);
        console.log("Otobüs Verileri:", data.result.records || []); // Terminalde görmek için log
        // console.log(busData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu."
        );
      }
    };

    fetchBusData();
  }, []);

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div>
      <h1>Otobüs {busNumber} Konumları</h1>
      <Map busLocations={busLocations} />
    </div>
  );
};

export default BusPage;

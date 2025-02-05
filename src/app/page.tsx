"use client";

import { useState, useEffect } from "react";
import Map from "./components/Map";

// Define types for bus details and other data structures
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

export default function Home() {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [busDetails, setBusDetails] = useState<BusDetails[]>([]);
  const [additionalBusDetails, setAdditionalBusDetails] = useState<
    AdditionalBusDetails[]
  >([]);
  const [extraBusDetails, setExtraBusDetails] = useState<ExtraBusDetails[]>([]);
  const [hatNo, setHatNo] = useState<string>("");
  const [busSearchTerm, setBusSearchTerm] = useState<string>(""); // Otobüs arama terimi
  const [additionalBusSearchTerm, setAdditionalBusSearchTerm] =
    useState<string>(""); // Ek otobüs arama terimi
  const [extraBusSearchTerm, setExtraBusSearchTerm] = useState<string>(""); // Ekstra otobüs arama terimi

  // Otobüs detaylarını sayfa yüklendiğinde bir kere çek
  useEffect(() => {
    fetchBusDetails(setBusDetails);
    fetchAdditionalBusDetails(setAdditionalBusDetails); // Ek verileri çek
    fetchExtraBusDetails(setExtraBusDetails); // Yeni verileri çek
  }, []);

  // Otobüs konumlarını sadece hatNo değiştiğinde çek
  useEffect(() => {
    fetchBusLocations(hatNo, setBusLocations);
  }, [hatNo]);

  // HAT_NO'ya göre filtreleme fonksiyonu
  const filteredBusDetails = busDetails.filter((bus) =>
    bus.HAT_NO.toString().includes(busSearchTerm)
  );

  const filteredAdditionalBusDetails = additionalBusDetails.filter((bus) =>
    bus.HAT_NO.toString().includes(additionalBusSearchTerm)
  );

  const filteredExtraBusDetails = extraBusDetails.filter((bus) =>
    bus.HAT_NO.toString().includes(extraBusSearchTerm)
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
      <h1>İzmir Otobüs Konumları</h1>
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
          justifyContent: "space-around",
          width: "100%",
          marginTop: 20,
        }}
      >
        {/* Otobüs Detayları */}
        <div
          style={{
            width: "300px",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
            marginRight: 20,
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
                <p>
                  <strong>Sıra:</strong> {bus.SIRA}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Ek Otobüs Detayları */}
        <div
          style={{
            width: "300px",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <h2 style={{ textAlign: "center" }}>Duyurular</h2>
          <input
            type="text"
            placeholder="Hat numarası ara"
            style={{
              padding: 8,
              borderRadius: 5,
              color: "black",
              marginBottom: 10,
            }}
            value={additionalBusSearchTerm}
            onChange={(e) => setAdditionalBusSearchTerm(e.target.value)}
          />
          {filteredAdditionalBusDetails.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            filteredAdditionalBusDetails.map((bus, index) => (
              <div
                key={index}
                style={{ borderBottom: "1px solid gray", padding: 10 }}
              >
                <p>
                  <strong>Hat No:</strong> {bus.HAT_NO}
                </p>
                <p>
                  <strong>Başlık:</strong> {bus.BASLIK}
                </p>
                <p>
                  <strong>Başlama Tarihi:</strong> {bus.BASLAMA_TARIHI}
                </p>
                <p>
                  <strong>Bitis Tarihi:</strong> {bus.BITIS_TARIHI}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Ekstra Otobüs Detayları */}
        <div
          style={{
            width: "300px",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            borderRadius: 5,
            padding: 10,
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
                <p>
                  <strong>Açıklama:</strong> {bus.ACIKLAMA}
                </p>
                <p>
                  <strong>Başlangıç:</strong> {bus.HAT_BASLANGIC}
                </p>
                <p>
                  <strong>Bitiriş:</strong> {bus.HAT_BITIS}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

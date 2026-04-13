import { useCallback, useEffect, useRef, useState } from "react";
import ParkScene from "./park/ParkScene";
import AttractionPanel from "./park/AttractionPanel";
import ShopPanel from "./park/ShopPanel";
import GameHUD from "./park/GameHUD";
import WelcomeMessage from "./park/WelcomeMessage";
import { CATALOG, ALL_ATTRACTION_TYPES, SHOP_CATALOG } from "./park/catalog";
import type { PlacedAttraction, AttractionType, PlacedShop, ShopType } from "./park/types";
import { useLang } from "../contexts/LanguageContext";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const INITIAL_MONEY = 1500;
const INCOME_INTERVAL_MS = 5000;
const VISITOR_FILL_TICKS = 5;

function pickInitialPos(): { x: number; z: number } {
  return { x: (Math.random() - 0.5) * 20, z: -8 + Math.random() * 6 };
}

function initialState() {
  const type = ALL_ATTRACTION_TYPES[Math.floor(Math.random() * ALL_ATTRACTION_TYPES.length)];
  const pos = pickInitialPos();
  const first: PlacedAttraction = { id: genId(), type, x: pos.x, z: pos.z };
  return {
    money: INITIAL_MONEY - CATALOG[type].cost,
    currentVisitors: 0,
    totalVisitors: 0,
    attractions: [first],
    shops: [] as PlacedShop[],
  };
}

export default function AmusementPark() {
  const [state, setState] = useState(initialState);
  const { money, currentVisitors, totalVisitors, attractions, shops } = state;
  const { lang } = useLang();
  const [placingType, setPlacingType] = useState<AttractionType | null>(null);
  const [placingShopType, setPlacingShopType] = useState<ShopType | null>(null);
  const [demolishing, setDemolishing] = useState(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Income tick
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const capacity = s.attractions.reduce((sum, a) => sum + CATALOG[a.type].visitors, 0);
        const attrMaint = s.attractions.reduce((sum, a) => sum + CATALOG[a.type].maintenance, 0);
        const shopMaint = s.shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].maintenance, 0);
        const shopRate  = s.shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].revenueRate, 0);
        const growBy = capacity > 0 ? Math.max(1, Math.ceil(capacity / VISITOR_FILL_TICKS)) : 0;
        const newCurrent = Math.min(capacity, s.currentVisitors + growBy);
        // Income = base (1/visitor) + shop revenue — all maintenance
        const income = newCurrent * (1 + shopRate) - attrMaint - shopMaint;
        return {
          ...s,
          money: s.money + Math.round(income),
          currentVisitors: newCurrent,
          totalVisitors: s.totalVisitors + newCurrent,
        };
      });
    }, INCOME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handleBalloonPop = useCallback(() => {
    setState((s) => ({ ...s, money: s.money + 1 }));
  }, []);

  const handlePlace = useCallback((x: number, z: number) => {
    if (!placingType) return;
    const cost = CATALOG[placingType].cost;
    setState((s) => {
      if (s.money < cost) return s;
      if (z >= 9.5 || Math.abs(x) >= 44) return s;
      if (s.attractions.some((a) => Math.hypot(a.x - x, a.z - z) < 5)) return s;
      if (s.shops.some((sh) => Math.hypot(sh.x - x, sh.z - z) < 4)) return s;
      return {
        ...s,
        money: s.money - cost,
        attractions: [...s.attractions, { id: genId(), type: placingType, x, z }],
      };
    });
    setPlacingType(null);
  }, [placingType]);

  const handlePlaceShop = useCallback((x: number, z: number) => {
    if (!placingShopType) return;
    const cost = SHOP_CATALOG[placingShopType].cost;
    setState((s) => {
      if (s.money < cost) return s;
      if (z >= 9.5 || Math.abs(x) >= 44) return s;
      if (s.attractions.some((a) => Math.hypot(a.x - x, a.z - z) < 4)) return s;
      if (s.shops.some((sh) => Math.hypot(sh.x - x, sh.z - z) < 3)) return s;
      return {
        ...s,
        money: s.money - cost,
        shops: [...s.shops, { id: genId(), type: placingShopType, x, z }],
      };
    });
    setPlacingShopType(null);
  }, [placingShopType]);

  const handleDemolish = useCallback((id: string) => {
    setState((s) => {
      const target = s.attractions.find((a) => a.id === id);
      if (!target) return s;
      return {
        ...s,
        money: s.money + Math.floor(CATALOG[target.type].cost / 2),
        currentVisitors: Math.max(0, s.currentVisitors - CATALOG[target.type].visitors),
        attractions: s.attractions.filter((a) => a.id !== id),
      };
    });
  }, []);

  const handleDemolishShop = useCallback((id: string) => {
    setState((s) => {
      const target = s.shops.find((sh) => sh.id === id);
      if (!target) return s;
      return {
        ...s,
        money: s.money + Math.floor(SHOP_CATALOG[target.type].cost / 2),
        shops: s.shops.filter((sh) => sh.id !== id),
      };
    });
  }, []);

  const toggleDemolish = useCallback(() => {
    setDemolishing((d) => !d);
    setPlacingType(null);
    setPlacingShopType(null);
  }, []);

  const handleSelectAttraction = useCallback((type: AttractionType | null) => {
    setPlacingType(type);
    if (type) { setPlacingShopType(null); setDemolishing(false); }
  }, []);

  const handleSelectShop = useCallback((type: ShopType | null) => {
    setPlacingShopType(type);
    if (type) { setPlacingType(null); setDemolishing(false); }
  }, []);

  // Derived values for HUD
  const capacity = attractions.reduce((sum, a) => sum + CATALOG[a.type].visitors, 0);
  const maintenanceCost =
    attractions.reduce((sum, a) => sum + CATALOG[a.type].maintenance, 0) +
    shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].maintenance, 0);
  const shopRate = shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].revenueRate, 0);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ParkScene
        attractions={attractions}
        placingType={placingType}
        onPlace={handlePlace}
        onBalloonPop={handleBalloonPop}
        demolishing={demolishing}
        onDemolish={handleDemolish}
        shops={shops}
        placingShopType={placingShopType}
        onPlaceShop={handlePlaceShop}
        onDemolishShop={handleDemolishShop}
      />

      {/* Left panel column: Build Attraction → Build Shop → Demolish */}
      <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 10, display: "flex", flexDirection: "column", gap: "8px" }}>
        <AttractionPanel
          money={money}
          placingType={placingType}
          onSelect={handleSelectAttraction}
        />
        <ShopPanel
          money={money}
          placingShopType={placingShopType}
          onSelect={handleSelectShop}
        />
        {/* Demolish button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            onClick={toggleDemolish}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: demolishing ? "1px solid rgba(255,100,50,0.7)" : "1px solid rgba(255,255,255,0.2)",
              background: demolishing ? "rgba(255,80,30,0.32)" : "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              textAlign: "left",
            }}
          >
            🚧 {lang === "jp" ? "取り壊す" : "Demolish"}
          </button>
          {demolishing && (
            <div style={{
              fontSize: "0.7rem", color: "#ffbb88",
              background: "rgba(0,0,0,0.6)", padding: "4px 8px",
              borderRadius: "6px", backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,100,50,0.3)", maxWidth: "160px",
            }}>
              {lang === "jp" ? "アトラクション・ショップをクリック" : "Click to demolish"}
            </div>
          )}
        </div>
      </div>

      <GameHUD
        money={money}
        currentVisitors={currentVisitors}
        totalVisitors={totalVisitors}
        capacity={capacity}
        maintenanceCost={maintenanceCost}
        shopRate={shopRate}
      />
      <WelcomeMessage />
    </div>
  );
}

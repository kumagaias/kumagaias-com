import { useCallback, useEffect, useRef, useState } from "react";
import ParkScene from "./park/ParkScene";
import type { WeatherType } from "./park/ParkScene";
import AttractionPanel from "./park/AttractionPanel";
import ShopPanel from "./park/ShopPanel";
import GameHUD from "./park/GameHUD";
import WelcomeMessage from "./park/WelcomeMessage";
import { CATALOG, SHOP_CATALOG, ALL_ATTRACTION_TYPES } from "./park/catalog";
import type { PlacedAttraction, AttractionType, PlacedShop, ShopType, AudienceType } from "./park/types";
import { useLang } from "../contexts/LanguageContext";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const INITIAL_MONEY = 1500;
const INCOME_INTERVAL_MS = 5000;
const VISITOR_FILL_TICKS = 5;
const SAVE_KEY = "kumagaias_park_save";
/** One-time entry ticket price per visitor. */
const TICKET_PRICE = 4;
/** Fraction of current visitors who "complete their visit" and leave each tick, making room for new ones. */
const TURNOVER_RATE = 0.25;
/**
 * Buzz decays this much per income tick (every 5 s).
 * At 0.015/tick it takes ~33 ticks (≈165 s) to fall from 1.0 → 0.5.
 */
const BUZZ_DECAY_PER_TICK = 0.015;

/** Each duplicate of the same type contributes 50% of the previous one. */
function calcCapacity(attractions: PlacedAttraction[]): number {
  const counts: Partial<Record<AttractionType, number>> = {};
  let total = 0;
  for (const a of attractions) {
    const n = counts[a.type] ?? 0;
    total += Math.round(CATALOG[a.type].visitors * Math.pow(0.5, n));
    counts[a.type] = n + 1;
  }
  return total;
}

/** Breaks down visitor capacity by audience type. */
function calcVisitorGroups(attractions: PlacedAttraction[]): Record<AudienceType, number> {
  const groups: Record<AudienceType, number> = { family: 0, couple: 0, solo: 0 };
  const counts: Partial<Record<AttractionType, number>> = {};
  for (const a of attractions) {
    const n = counts[a.type] ?? 0;
    const effective = Math.round(CATALOG[a.type].visitors * Math.pow(0.5, n));
    const aud = CATALOG[a.type].audience;
    for (const t of aud) groups[t] += effective / aud.length;
    counts[a.type] = n + 1;
  }
  return { family: Math.round(groups.family), couple: Math.round(groups.couple), solo: Math.round(groups.solo) };
}

/**
 * Diversity bonus multiplier on gross income.
 * 1 audience type → ×0.9 | 2 types → ×1.0 | 3 types → ×1.15
 */
function calcDiversityBonus(attractions: PlacedAttraction[]): number {
  const count = new Set(attractions.flatMap(a => CATALOG[a.type].audience)).size;
  return count >= 3 ? 1.15 : count === 2 ? 1.0 : 0.9;
}

function pickInitialPos(): { x: number; z: number } {
  const side = Math.random() < 0.5 ? -1 : 1;
  return { x: side * (6 + Math.random() * 8), z: -12 + Math.random() * 4 };
}

const CHEAP_STARTERS: AttractionType[] = ["shootingGallery", "merryGoRound", "coffeeCups", "swingCarousel"];

const MILESTONES = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];

interface GameState {
  money: number;
  currentVisitors: number;
  totalVisitors: number;
  attractions: PlacedAttraction[];
  shops: PlacedShop[];
  /** Buzz multiplier: 1.0 (full hype) → 0.5 (stale). Applied to effective visitor capacity. */
  buzz: number;
}

function freshState(): GameState {
  const type = CHEAP_STARTERS[Math.floor(Math.random() * CHEAP_STARTERS.length)];
  const pos = pickInitialPos();
  const first: PlacedAttraction = { id: genId(), type, x: pos.x, z: pos.z };
  return {
    money: INITIAL_MONEY - CATALOG[type].cost,
    currentVisitors: 0,
    totalVisitors: 0,
    attractions: [first],
    shops: [] as PlacedShop[],
    buzz: 1.0,
  };
}

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.attractions || !parsed.shops) return null;
    return { ...parsed, buzz: parsed.buzz ?? 1.0 };
  } catch {
    return null;
  }
}

function initialState(): GameState {
  return loadSavedState() ?? freshState();
}

export default function AmusementPark() {
  const [state, setState] = useState(initialState);
  const { money, currentVisitors, totalVisitors, attractions, shops, buzz } = state;
  const { lang } = useLang();
  const [placingType, setPlacingType] = useState<AttractionType | null>(null);
  const [placingShopType, setPlacingShopType] = useState<ShopType | null>(null);
  const [demolishing, setDemolishing] = useState(false);
  const [attrPanelOpen, setAttrPanelOpen] = useState(false);
  const [shopPanelOpen, setShopPanelOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherType>("sunny");
  const weatherRef = useRef<WeatherType>("sunny");
  const celebrateTriggerRef = useRef<((level?: number) => void) | null>(null);
  const nextMilestoneRef = useRef(0);
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);
  const milestoneMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWeatherChange = useCallback((w: WeatherType) => {
    setWeather(w);
    weatherRef.current = w;
  }, []);

  // Escape key: cancel any active placing/demolishing action
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPlacingType(null);
        setPlacingShopType(null);
        setDemolishing(false);
        setAttrPanelOpen(false);
        setShopPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sync nextMilestone ref when state is loaded
  useEffect(() => {
    const idx = MILESTONES.findIndex((m) => state.totalVisitors < m);
    nextMilestoneRef.current = idx === -1 ? MILESTONES.length : idx;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Income tick
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const capacity = calcCapacity(s.attractions);
        const attrMaint = s.attractions.reduce((sum, a) => sum + CATALOG[a.type].maintenance, 0);
        const shopMaint = s.shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].maintenance, 0);
        const shopRate  = s.shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].revenueRate, 0);
        const weatherMult = weatherRef.current === "rainy" ? 0.4 : weatherRef.current === "cloudy" ? 0.85 : 1.0;
        // Buzz multiplier: hype decays each tick; new (unique) attraction placement resets it to 1.0
        const newBuzz = Math.max(0.5, s.buzz - BUZZ_DECAY_PER_TICK);
        const effectiveCap = Math.floor(capacity * weatherMult * newBuzz);
        const growBy = effectiveCap > 0 ? Math.max(1, Math.ceil(effectiveCap / VISITOR_FILL_TICKS)) : 0;
        const newCurrent = Math.min(effectiveCap, Math.max(0, s.currentVisitors + (weatherRef.current === "rainy" ? -Math.ceil(s.currentVisitors * 0.15) : growBy)));
        // Visitors who complete their visit and leave (= new slots for incoming guests)
        const turnover = Math.floor(s.currentVisitors * TURNOVER_RATE);
        // New arrivals = visitors filling empty slots (growth) + turnover replacements
        const newArrivals = Math.max(0, newCurrent - s.currentVisitors) + turnover;
        // Diversity bonus: reward balanced audience coverage
        const audienceCount = new Set(s.attractions.flatMap(a => CATALOG[a.type].audience)).size;
        const diversityMult = audienceCount >= 3 ? 1.15 : audienceCount === 2 ? 1.0 : 0.9;
        // Income: entry ticket + shop spend (with diversity multiplier) - maintenance
        const grossIncome = newArrivals * TICKET_PRICE + newCurrent * shopRate;
        const income = Math.round(grossIncome * diversityMult) - attrMaint - shopMaint;
        const newTotal = s.totalVisitors + newArrivals;
        // Milestone check
        const milestone = MILESTONES[nextMilestoneRef.current];
        if (milestone !== undefined && newTotal >= milestone) {
          nextMilestoneRef.current += 1;
          const level = nextMilestoneRef.current - 1;
          setTimeout(() => celebrateTriggerRef.current?.(level), 0);
          const newlyUnlocked = ALL_ATTRACTION_TYPES.filter(t => CATALOG[t].unlockAt === milestone);
          const unlockLine = newlyUnlocked.length > 0
            ? (lang === "jp"
              ? `\n🔓 ${newlyUnlocked.map(t => CATALOG[t].name).join("・")} が解放！`
              : `\n🔓 Unlocked: ${newlyUnlocked.map(t => CATALOG[t].nameEn).join(", ")}!`)
            : "";
          const msg = lang === "jp"
            ? `累計 ${milestone.toLocaleString()} 人達成！おめでとう！🎉${unlockLine}`
            : `${milestone.toLocaleString()} total visitors! Congrats! 🎉${unlockLine}`;
          setTimeout(() => {
            setMilestoneMsg(msg);
            if (milestoneMsgTimerRef.current) clearTimeout(milestoneMsgTimerRef.current);
            milestoneMsgTimerRef.current = setTimeout(() => setMilestoneMsg(null), 4000);
          }, 0);
        }
        return {
          ...s,
          money: s.money + Math.round(income),
          currentVisitors: newCurrent,
          totalVisitors: newTotal,
          buzz: newBuzz,
        };
      });
    }, INCOME_INTERVAL_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleBalloonPop = useCallback(() => {
    setState((s) => ({ ...s, money: s.money + 1 }));
  }, []);

  const handlePlace = useCallback((x: number, z: number) => {
    if (!placingType) return;
    const cost = CATALOG[placingType].cost;
    setState((s) => {
      if (s.money < cost) return s;
      if (z >= 8.5 || Math.abs(x) >= 44) return s;
      if (s.attractions.some((a) => Math.hypot(a.x - x, a.z - z) < 7)) return s;
      if (s.shops.some((sh) => Math.hypot(sh.x - x, sh.z - z) < 5)) return s;
      // Placing a brand-new type refreshes buzz to 100%
      const isNewType = !s.attractions.some(a => a.type === placingType);
      return {
        ...s,
        money: s.money - cost,
        attractions: [...s.attractions, { id: genId(), type: placingType, x, z }],
        buzz: isNewType ? 1.0 : s.buzz,
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
    const msg = lang === "jp"
      ? "このアトラクションを取り壊しますか？\n建設費の50%が返金されます。"
      : "Demolish this attraction?\nYou'll receive 50% of the build cost.";
    if (!window.confirm(msg)) return;
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
  }, [lang]);

  const handleDemolishShop = useCallback((id: string) => {
    const msg = lang === "jp"
      ? "このショップを取り壊しますか？\n建設費の50%が返金されます。"
      : "Demolish this shop?\nYou'll receive 50% of the build cost.";
    if (!window.confirm(msg)) return;
    setState((s) => {
      const target = s.shops.find((sh) => sh.id === id);
      if (!target) return s;
      return {
        ...s,
        money: s.money + Math.floor(SHOP_CATALOG[target.type].cost / 2),
        shops: s.shops.filter((sh) => sh.id !== id),
      };
    });
  }, [lang]);

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

  const handleSave = useCallback(() => {
    setState((s) => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      return s;
    });
  }, []);

  const handleRestart = useCallback(() => {
    const msg = lang === "jp"
      ? "最初からやり直しますか？\n現在のデータは消えます。"
      : "Restart from scratch?\nAll progress will be lost.";
    if (!window.confirm(msg)) return;
    localStorage.removeItem(SAVE_KEY);
    const fresh = freshState();
    nextMilestoneRef.current = 0;
    setState(fresh);
  }, [lang]);

  // Derived values for HUD
  const capacity = calcCapacity(attractions);
  // Buzz-adjusted capacity — used as denominator for animated people count in ParkScene.
  // Weather is not available here, so only buzz is applied; ParkScene handles weather visually.
  const effectiveCapacity = Math.max(1, Math.floor(capacity * buzz));
  const maintenanceCost =
    attractions.reduce((sum, a) => sum + CATALOG[a.type].maintenance, 0) +
    shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].maintenance, 0);
  const shopRate = shops.reduce((sum, sh) => sum + SHOP_CATALOG[sh.type].revenueRate, 0);
  // Estimated gross per tick: ticket income from turnover + shop income (with diversity bonus)
  const turnoverEstimate = Math.floor(currentVisitors * TURNOVER_RATE);
  const diversityBonus = calcDiversityBonus(attractions);
  const grossPerTick = Math.round((turnoverEstimate * TICKET_PRICE + currentVisitors * shopRate) * diversityBonus);
  const visitorGroups = calcVisitorGroups(attractions);

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
        onWeatherChange={handleWeatherChange}
        celebrateTriggerRef={celebrateTriggerRef}
        currentVisitors={currentVisitors}
        capacity={capacity}
        effectiveCapacity={effectiveCapacity}
      />

      {/* Left panel column: Build Attraction → Build Shop → Demolish */}
      <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 10, display: "flex", flexDirection: "column", gap: "8px" }}>
        <AttractionPanel
          money={money}
          totalVisitors={totalVisitors}
          placingType={placingType}
          onSelect={handleSelectAttraction}
          attractions={attractions}
          expanded={attrPanelOpen}
          onToggle={() => { setAttrPanelOpen(v => !v); setShopPanelOpen(false); }}
        />
        <ShopPanel
          money={money}
          totalVisitors={totalVisitors}
          placingShopType={placingShopType}
          onSelect={handleSelectShop}
          expanded={shopPanelOpen}
          onToggle={() => { setShopPanelOpen(v => !v); setAttrPanelOpen(false); }}
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
              width: "190px",
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
        grossPerTick={grossPerTick}
        weather={weather}
        visitorGroups={visitorGroups}
        diversityBonus={diversityBonus}
        buzz={buzz}
        onSave={handleSave}
        onRestart={handleRestart}
      />

      {/* Milestone toast */}
      {milestoneMsg && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.82)",
          color: "#fff",
          padding: "18px 32px",
          borderRadius: "16px",
          fontSize: "1.2rem",
          fontWeight: 800,
          textAlign: "center",
          zIndex: 20,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,220,80,0.5)",
          pointerEvents: "none",
          whiteSpace: "pre-line",
          animation: "fadeInOut 4s ease forwards",
        }}>
          {milestoneMsg}
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translate(-50%, -60%) scale(0.85); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `}</style>

      <WelcomeMessage />
    </div>
  );
}

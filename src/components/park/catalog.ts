import type { AttractionType, ShopType } from "./types";

export interface CatalogEntry {
  name: string;
  nameEn: string;
  cost: number;
  visitors: number;   // capacity (max visitors this attraction can draw)
  maintenance: number; // cost deducted per income tick
  emoji: string;
}

// Higher visitor capacity = higher maintenance cost.
// At full capacity, net income = visitors - maintenance.
// During ramp-up (first ~5 ticks), maintenance can exceed income → manage cash flow!
export const CATALOG: Record<AttractionType, CatalogEntry> = {
  ferrisWheel:     { name: "観覧車",             nameEn: "Ferris Wheel",     cost: 400, visitors: 50, maintenance: 18, emoji: "🎡" },
  rollerCoaster:   { name: "ジェットコースター", nameEn: "Roller Coaster",   cost: 350, visitors: 45, maintenance: 16, emoji: "🎢" },
  dropTower:       { name: "ドロップタワー",     nameEn: "Drop Tower",       cost: 300, visitors: 40, maintenance: 14, emoji: "🗼" },
  miniTrain:       { name: "ミニ電車",           nameEn: "Mini Train",       cost: 250, visitors: 30, maintenance: 10, emoji: "🚂" },
  swingCarousel:   { name: "スイング",           nameEn: "Swing Carousel",   cost: 220, visitors: 28, maintenance:  9, emoji: "🎪" },
  coffeeCups:      { name: "コーヒーカップ",     nameEn: "Coffee Cups",      cost: 200, visitors: 25, maintenance:  8, emoji: "☕" },
  merryGoRound:    { name: "メリーゴーランド",   nameEn: "Merry-Go-Round",   cost: 180, visitors: 20, maintenance:  6, emoji: "🎠" },
  shootingGallery: { name: "射的",               nameEn: "Shooting Gallery", cost: 120, visitors: 15, maintenance:  4, emoji: "🎯" },
};

export const ALL_ATTRACTION_TYPES = Object.keys(CATALOG) as AttractionType[];

// ── Shop catalog ─────────────────────────────────────────────────────────────

export interface ShopCatalogEntry {
  name: string;
  nameEn: string;
  cost: number;
  revenueRate: number; // extra income per current visitor per tick
  maintenance: number;
  emoji: string;
}

// Shops don't add visitor capacity — they earn extra income from existing guests.
// More expensive shop = higher revenueRate per visitor.
export const SHOP_CATALOG: Record<ShopType, ShopCatalogEntry> = {
  foodStall:  { name: "屋台",       nameEn: "Food Stall",  cost: 100, revenueRate: 0.4, maintenance: 3,  emoji: "🍡" },
  cafe:       { name: "カフェ",     nameEn: "Café",        cost: 200, revenueRate: 0.8, maintenance: 6,  emoji: "☕" },
  restaurant: { name: "レストラン", nameEn: "Restaurant",  cost: 350, revenueRate: 1.5, maintenance: 11, emoji: "🍽️" },
};

export const ALL_SHOP_TYPES = Object.keys(SHOP_CATALOG) as ShopType[];

import type { AttractionType, ShopType, AudienceType } from "./types";

export interface CatalogEntry {
  name: string;
  nameEn: string;
  cost: number;
  visitors: number;   // capacity (max visitors this attraction can draw)
  maintenance: number; // cost deducted per income tick
  emoji: string;
  audience: AudienceType[];
  unlockAt?: number;  // total visitors required to unlock (undefined = always available)
}

// Higher visitor capacity = higher maintenance cost.
// At full capacity, net income = visitors - maintenance.
// During ramp-up (first ~5 ticks), maintenance can exceed income → manage cash flow!
export const CATALOG: Record<AttractionType, CatalogEntry> = {
  shootingGallery: { name: "射的",               nameEn: "Shooting Gallery", cost: 120, visitors: 15, maintenance:  4, emoji: "🎯", audience: ["couple", "solo"] },
  merryGoRound:    { name: "メリーゴーランド",   nameEn: "Merry-Go-Round",   cost: 180, visitors: 20, maintenance:  6, emoji: "🎠", audience: ["family", "couple"] },
  coffeeCups:      { name: "コーヒーカップ",     nameEn: "Coffee Cups",      cost: 200, visitors: 25, maintenance:  8, emoji: "☕", audience: ["family", "couple"] },
  swingCarousel:   { name: "スイング",           nameEn: "Swing Carousel",   cost: 220, visitors: 28, maintenance:  9, emoji: "🎪", audience: ["couple", "solo"] },
  miniTrain:       { name: "ミニ電車",           nameEn: "Mini Train",       cost: 250, visitors: 30, maintenance: 10, emoji: "🚂", audience: ["family"] },
  dropTower:       { name: "ドロップタワー",     nameEn: "Drop Tower",       cost: 300, visitors: 40, maintenance: 14, emoji: "🗼", audience: ["solo"] },
  ferrisWheel:     { name: "観覧車",             nameEn: "Ferris Wheel",     cost: 550, visitors: 50, maintenance: 20, emoji: "🎡", audience: ["family", "couple"], unlockAt: 500 },
  rollerCoaster:   { name: "ジェットコースター", nameEn: "Roller Coaster",   cost: 700, visitors: 60, maintenance: 26, emoji: "🎢", audience: ["couple", "solo"], unlockAt: 1000 },
  bumperCars:      { name: "バンパーカー",       nameEn: "Bumper Cars",      cost: 280, visitors: 35, maintenance: 12, emoji: "🚗", audience: ["family", "couple"], unlockAt: 300 },
  hauntedHouse:    { name: "お化け屋敷",         nameEn: "Haunted House",    cost: 400, visitors: 45, maintenance: 16, emoji: "👻", audience: ["couple", "solo"], unlockAt: 800 },
  waterSlide:      { name: "ウォータースライダー", nameEn: "Water Slide",    cost: 500, visitors: 55, maintenance: 22, emoji: "💧", audience: ["family", "couple"], unlockAt: 2000 },
  darkRide:        { name: "ダークライド",       nameEn: "Dark Ride",        cost: 800, visitors: 70, maintenance: 30, emoji: "🌌", audience: ["family", "couple", "solo"], unlockAt: 5000 },
};

// Sorted by cost (cheapest first) — matches CATALOG key order above
export const ALL_ATTRACTION_TYPES = Object.keys(CATALOG) as AttractionType[];

// ── Shop catalog ─────────────────────────────────────────────────────────────

export interface ShopCatalogEntry {
  name: string;
  nameEn: string;
  cost: number;
  revenueRate: number; // extra income per current visitor per tick
  maintenance: number;
  emoji: string;
  unlockAt?: number;  // total visitors required to unlock (undefined = always available)
}

// Shops don't add visitor capacity — they earn extra income from existing guests.
// More expensive shop = higher revenueRate per visitor.
export const SHOP_CATALOG: Record<ShopType, ShopCatalogEntry> = {
  foodStall:    { name: "屋台",           nameEn: "Food Stall",    cost: 100, revenueRate: 0.4, maintenance:  3, emoji: "🍡" },
  cafe:         { name: "カフェ",         nameEn: "Café",          cost: 200, revenueRate: 0.8, maintenance:  6, emoji: "☕" },
  restaurant:   { name: "レストラン",     nameEn: "Restaurant",    cost: 350, revenueRate: 1.5, maintenance: 11, emoji: "🍽️" },
  iceCreamShop: { name: "アイスクリーム", nameEn: "Ice Cream",     cost: 150, revenueRate: 0.6, maintenance:  4, emoji: "🍦", unlockAt: 200 },
  souvenir:     { name: "お土産屋",       nameEn: "Souvenir Shop", cost: 280, revenueRate: 1.2, maintenance:  8, emoji: "🎁", unlockAt: 500 },
  hotel:        { name: "ホテル",         nameEn: "Hotel",         cost: 600, revenueRate: 3.0, maintenance: 20, emoji: "🏨", unlockAt: 3000 },
};

export const ALL_SHOP_TYPES = Object.keys(SHOP_CATALOG) as ShopType[];

export type AttractionType =
  | "ferrisWheel"
  | "rollerCoaster"
  | "coffeeCups"
  | "merryGoRound"
  | "shootingGallery"
  | "miniTrain"
  | "dropTower"
  | "swingCarousel";

export interface PlacedAttraction {
  id: string;
  type: AttractionType;
  x: number;
  z: number;
}

export type ShopType = "foodStall" | "cafe" | "restaurant";

export interface PlacedShop {
  id: string;
  type: ShopType;
  x: number;
  z: number;
}

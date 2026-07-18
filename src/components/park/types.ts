export type AudienceType = "family" | "couple" | "solo";

export type AttractionType =
  | "ferrisWheel"
  | "rollerCoaster"
  | "coffeeCups"
  | "merryGoRound"
  | "shootingGallery"
  | "miniTrain"
  | "dropTower"
  | "swingCarousel"
  | "bumperCars"
  | "hauntedHouse"
  | "waterSlide"
  | "darkRide";

export interface PlacedAttraction {
  id: string;
  type: AttractionType;
  x: number;
  z: number;
}

export type ShopType = "foodStall" | "cafe" | "restaurant" | "iceCreamShop" | "souvenir" | "hotel";

export interface PlacedShop {
  id: string;
  type: ShopType;
  x: number;
  z: number;
}

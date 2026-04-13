import * as THREE from "three";
import type { PlacedShop } from "./types";
import type { Animator, BuildResult } from "./builders";

// ── Food Stall (屋台) ─────────────────────────────────────────────────────────

function buildFoodStall(container: THREE.Object3D, x: number, z: number): BuildResult {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const woodMat = new THREE.MeshLambertMaterial({ color: 0xc8a26a });
  const redMat  = new THREE.MeshLambertMaterial({ color: 0xff3333 });
  const whtMat  = new THREE.MeshLambertMaterial({ color: 0xfff8f0 });

  // Base counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.0), woodMat);
  counter.position.set(0, 0.4, 0);
  g.add(counter);

  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.15), woodMat);
  backWall.position.set(0, 1.2, -0.43);
  g.add(backWall);

  // Striped awning (alternating red/white panels)
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.06, 0.9),
      i % 2 === 0 ? redMat : whtMat
    );
    stripe.position.set(-1.0 + i * 0.48, 1.95, 0.1);
    stripe.rotation.x = 0.25;
    g.add(stripe);
  }

  // Small items on counter (food stall goods)
  const itemColors = [0xff6633, 0xffcc00, 0xff3388];
  for (let i = 0; i < 3; i++) {
    const item = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      new THREE.MeshLambertMaterial({ color: itemColors[i] })
    );
    item.position.set(-0.5 + i * 0.5, 0.9, 0.1);
    g.add(item);
  }

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [counter], burstColor: 0xff6633 };
}

// ── Café ─────────────────────────────────────────────────────────────────────

function buildCafe(container: THREE.Object3D, x: number, z: number): BuildResult {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const wallMat   = new THREE.MeshLambertMaterial({ color: 0xfff3e0 });
  const roofMat   = new THREE.MeshLambertMaterial({ color: 0x5c9e5c });
  const winMat    = new THREE.MeshLambertMaterial({ color: 0xaaddff });
  const doorMat   = new THREE.MeshLambertMaterial({ color: 0x8b5e3c });
  const tableMat  = new THREE.MeshLambertMaterial({ color: 0xddbb88 });

  // Building body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.0), wallMat);
  body.position.set(0, 1.1, 0);
  g.add(body);

  // Roof (flat with slight overhang)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.18, 2.3), roofMat);
  roof.position.set(0, 2.29, 0);
  g.add(roof);

  // Windows (2 front)
  [-0.75, 0.75].forEach(wx => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), winMat);
    win.position.set(wx, 1.3, 1.05);
    g.add(win);
  });

  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.1), doorMat);
  door.position.set(0, 0.55, 1.05);
  g.add(door);

  // Green awning over entrance
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.55), roofMat);
  awning.position.set(0, 1.05, 1.35);
  awning.rotation.x = -0.15;
  g.add(awning);

  // Outdoor table + legs
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.07, 12), tableMat);
  tableTop.position.set(1.6, 0.72, 0.3);
  g.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), tableMat);
  tableLeg.position.set(1.6, 0.35, 0.3);
  g.add(tableLeg);

  // Two chairs (small boxes)
  [[1.2, 0.2], [2.0, 0.4]].forEach(([cx, cz]) => {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), tableMat);
    chair.position.set(cx, 0.34, cz);
    g.add(chair);
  });

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [body], burstColor: 0x5c9e5c };
}

// ── Restaurant ───────────────────────────────────────────────────────────────

function buildRestaurant(container: THREE.Object3D, x: number, z: number): BuildResult {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const wallMat  = new THREE.MeshLambertMaterial({ color: 0xd45f3c });
  const roofMat  = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  const winMat   = new THREE.MeshLambertMaterial({ color: 0xaaddff });
  const signMat  = new THREE.MeshLambertMaterial({ color: 0xffee55 });
  const trimMat  = new THREE.MeshLambertMaterial({ color: 0xfff0cc });

  // Building body
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 2.6), wallMat);
  body.position.set(0, 1.5, 0);
  g.add(body);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.22, 2.9), roofMat);
  roof.position.set(0, 3.11, 0);
  g.add(roof);

  // Trim strip
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.2, 2.65), trimMat);
  trim.position.set(0, 2.7, 0);
  g.add(trim);

  // Windows (3 front)
  [-1.1, 0, 1.1].forEach(wx => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.1), winMat);
    win.position.set(wx, 1.65, 1.35);
    g.add(win);
  });

  // Sign above entrance
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.12), signMat);
  sign.position.set(0, 2.95, 1.37);
  g.add(sign);

  // Steps
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.3), trimMat);
  step1.position.set(0, 0.06, 1.6);
  g.add(step1);
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.25), trimMat);
  step2.position.set(0, 0.18, 1.45);
  g.add(step2);

  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.1), new THREE.MeshLambertMaterial({ color: 0x4a2f1a }));
  door.position.set(0, 0.65, 1.36);
  g.add(door);

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [body], burstColor: 0xffee55 };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export function buildShop(container: THREE.Object3D, shop: PlacedShop): BuildResult {
  switch (shop.type) {
    case "foodStall":  return buildFoodStall(container, shop.x, shop.z);
    case "cafe":       return buildCafe(container, shop.x, shop.z);
    case "restaurant": return buildRestaurant(container, shop.x, shop.z);
  }
}

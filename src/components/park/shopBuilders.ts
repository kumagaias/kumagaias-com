import * as THREE from "three";
import type { PlacedShop } from "./types";
import type { Animator, BuildResult } from "./builders";

function gm(color: number, emissive: number, intensity = 0.8): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: 0 });
  mat.userData.ni = intensity;
  return mat;
}

function addBulbs(
  parent: THREE.Object3D,
  count: number,
  getPos: (i: number) => [number, number, number],
  colors: number[],
): THREE.MeshLambertMaterial[] {
  const mats: THREE.MeshLambertMaterial[] = [];
  for (let i = 0; i < count; i++) {
    const [bx, by, bz] = getPos(i);
    const col = colors[i % colors.length];
    const mat = gm(col, col, 2.5);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), mat);
    bulb.position.set(bx, by, bz);
    parent.add(bulb);
    mats.push(mat);
  }
  return mats;
}

// ── Food Stall ────────────────────────────────────────────────────────────────

function buildFoodStall(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const woodMat = new THREE.MeshLambertMaterial({ color: 0xc8a26a });
  const redMat  = new THREE.MeshLambertMaterial({ color: 0xff3333 });
  const whtMat  = new THREE.MeshLambertMaterial({ color: 0xfff8f0 });

  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 1.1), woodMat);
  counter.position.set(0, 0.42, 0);
  g.add(counter);
  for (const [cx, cz] of [[-1.1, -0.42], [1.1, -0.42], [-1.1, 0.42], [1.1, 0.42]] as [number,number][]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), woodMat);
    leg.position.set(cx, 0.42, cz);
    g.add(leg);
  }

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.18), woodMat);
  backWall.position.set(0, 1.3, -0.46);
  g.add(backWall);
  const panelMat = new THREE.MeshLambertMaterial({ color: 0xe0bb88 });
  for (const bx of [-0.8, 0.8]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, 0.06), panelMat);
    panel.position.set(bx, 1.25, -0.36);
    g.add(panel);
  }

  const postMat = new THREE.MeshLambertMaterial({ color: 0x7a4e28 });
  for (const px of [-1.2, 1.2]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 8), postMat);
    post.position.set(px, 1.2, 0.5);
    g.add(post);
  }

  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 1.0), i % 2 === 0 ? redMat : whtMat);
    stripe.position.set(-1.1 + i * 0.52, 2.15, 0.12);
    stripe.rotation.x = 0.28;
    g.add(stripe);
  }
  for (let i = 0; i < 9; i++) {
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.06), redMat);
    fringe.position.set(-1.0 + i * 0.26, 1.88, 0.62);
    g.add(fringe);
  }

  // Paper lanterns
  for (let i = 0; i < 2; i++) {
    const lx = -0.5 + i * 1.0;
    const lMat = gm([0xff4444, 0xffaa00][i], [0xff4444, 0xffaa00][i], 1.5);
    nightMats.push(lMat);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), new THREE.MeshLambertMaterial({ color: 0x888888 }));
    str.position.set(lx, 2.25, 0.0);
    g.add(str);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 12), lMat);
    body.position.set(lx, 2.0, 0.0);
    g.add(body);
    const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.07, 8), lMat);
    capT.position.set(lx, 2.18, 0.0);
    g.add(capT);
    const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.07, 8), lMat);
    capB.position.set(lx, 1.82, 0.0);
    capB.rotation.z = Math.PI;
    g.add(capB);
  }

  // Pennant flags
  const flagColors = [0xff3333, 0xffcc00, 0x33aaff, 0x33cc33, 0xff33aa];
  for (let i = 0; i < 5; i++) {
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 3), new THREE.MeshLambertMaterial({ color: flagColors[i] }));
    flag.position.set(-1.0 + i * 0.5, 2.42, 0.32);
    flag.rotation.z = Math.PI;
    g.add(flag);
  }

  // Food items
  const foodColors = [0xff6633, 0xffcc00, 0xff3388, 0x66cc33, 0xff9900];
  for (let i = 0; i < 4; i++) {
    const food = new THREE.Mesh(
      i % 2 === 0 ? new THREE.SphereGeometry(0.13, 8, 8) : new THREE.BoxGeometry(0.18, 0.18, 0.18),
      new THREE.MeshLambertMaterial({ color: foodColors[i] }),
    );
    food.position.set(-0.6 + i * 0.42, 0.95, 0.1);
    g.add(food);
  }
  for (let i = 0; i < 3; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), new THREE.MeshLambertMaterial({ color: 0xcc9955 }));
    stick.position.set(-0.3 + i * 0.3, 1.15, 0.28);
    stick.rotation.x = 0.3;
    g.add(stick);
    for (let b = 0; b < 3; b++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: foodColors[(i + b) % 5] }));
      ball.position.set(-0.3 + i * 0.3, 0.98 + b * 0.18, 0.28 + b * 0.08);
      g.add(ball);
    }
  }

  nightMats.push(...addBulbs(g, 7, (i) => [-1.2 + i * 0.4, 2.16, 0.65], [0xff4444, 0xffcc00, 0x44aaff, 0xff88ff, 0x44ffaa]));

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [counter], burstColor: 0xff6633, nightMaterials: nightMats };
}

// ── Café ──────────────────────────────────────────────────────────────────────

function buildCafe(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xfff3e0 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x5c9e5c });
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x7a4e28 });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xd4f0d4 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.4, 2.2), wallMat);
  body.position.set(0, 1.2, 0);
  g.add(body);
  for (const cx of [-1.4, 1.4]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), trimMat);
    strip.position.set(cx, 1.2, 1.05);
    g.add(strip);
  }

  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.2, 2.5), roofMat);
  roof.position.set(0, 2.5, 0);
  g.add(roof);
  const gable = new THREE.Mesh(new THREE.BoxGeometry(3.32, 0.75, 0.2), roofMat);
  gable.position.set(0, 2.8, 0);
  g.add(gable);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), new THREE.MeshLambertMaterial({ color: 0xcc7755 }));
  chimney.position.set(0.8, 2.95, -0.5);
  g.add(chimney);

  for (const wx of [-0.8, 0.8]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.1), trimMat);
    frame.position.set(wx, 1.38, 1.11);
    g.add(frame);
    const winMat = gm(0xaaddff, 0xffdd88, 0.8);
    nightMats.push(winMat);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.08), winMat);
    win.position.set(wx, 1.38, 1.13);
    g.add(win);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.05), trimMat);
    hBar.position.set(wx, 1.38, 1.16);
    g.add(hBar);
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.58, 0.05), trimMat);
    vBar.position.set(wx, 1.38, 1.16);
    g.add(vBar);
  }
  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.55), gm(0xaaddff, 0xffdd88, 0.7));
  sideWin.position.set(-1.51, 1.38, 0);
  nightMats.push(sideWin.material as THREE.MeshLambertMaterial);
  g.add(sideWin);

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.0, 0.1), trimMat);
  doorFrame.position.set(0, 0.6, 1.11);
  g.add(doorFrame);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.92, 0.1), doorMat);
  door.position.set(0, 0.6, 1.14);
  g.add(door);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.65), roofMat);
  awning.position.set(0, 1.12, 1.45);
  awning.rotation.x = -0.18;
  g.add(awning);

  const signMat = gm(0x2e7d32, 0x44cc44, 1.0);
  nightMats.push(signMat);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.42, 0.14), signMat);
  sign.position.set(0, 1.7, 1.12);
  g.add(sign);
  nightMats.push(...addBulbs(g, 5, (i) => [-0.7 + i * 0.35, 1.7, 1.2], [0xffffff, 0xffdd88]));

  // Flower boxes
  const flowerColors = [0xff4488, 0xff8800, 0xff4444, 0xffee22, 0xff44aa];
  for (const wx of [-0.8, 0.8]) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.22), new THREE.MeshLambertMaterial({ color: 0x8b5c2a }));
    box.position.set(wx, 0.98, 1.1);
    g.add(box);
    for (let f = 0; f < 4; f++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 4), new THREE.MeshLambertMaterial({ color: 0x338833 }));
      stem.position.set(wx - 0.23 + f * 0.16, 1.17, 1.12);
      g.add(stem);
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshLambertMaterial({ color: flowerColors[f % 5] }));
      petal.position.set(wx - 0.23 + f * 0.16, 1.27, 1.12);
      g.add(petal);
    }
  }

  // Outdoor table + umbrella
  const tableMat = new THREE.MeshLambertMaterial({ color: 0xddbb88 });
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.07, 14), tableMat);
  tableTop.position.set(1.75, 0.76, 0.4);
  g.add(tableTop);
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.74, 8), tableMat), { position: new THREE.Vector3(1.75, 0.37, 0.4) }));
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 6), new THREE.MeshLambertMaterial({ color: 0x888888 })), { position: new THREE.Vector3(1.75, 1.62, 0.4) }));
  const umbrellaCone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.3, 16), new THREE.MeshLambertMaterial({ color: 0xff6644 }));
  umbrellaCone.rotation.z = Math.PI;
  umbrellaCone.position.set(1.75, 2.38, 0.4);
  g.add(umbrellaCone);
  for (const [cx, cz] of [[1.35, 0.05], [2.15, 0.75]] as [number,number][]) {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), tableMat);
    chair.position.set(cx, 0.37, cz);
    g.add(chair);
  }

  nightMats.push(...addBulbs(g, 8, (i) => [-1.45 + i * 0.42, 2.62, 1.16], [0xffdd88, 0xff8844, 0xffee44, 0x88ffcc]));

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [body], burstColor: 0x5c9e5c, nightMaterials: nightMats };
}

// ── Restaurant ────────────────────────────────────────────────────────────────

function buildRestaurant(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xd45f3c });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xfff0cc });
  const colMat  = new THREE.MeshLambertMaterial({ color: 0xf0e0c0 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.2, 2.8), wallMat);
  body.position.set(0, 1.6, 0);
  g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.22, 2.85), trimMat);
  band.position.set(0, 1.7, 0);
  g.add(band);

  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.25, 3.1), roofMat), { position: new THREE.Vector3(0, 3.22, 0) }));
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(4.12, 0.35, 3.12), trimMat);
  parapet.position.set(0, 3.57, 0);
  g.add(parapet);
  for (const nx of [-1, 0, 1]) {
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.06), roofMat);
    notch.position.set(nx * 1.1, 3.57, 1.57);
    g.add(notch);
  }

  // Columns
  for (const cx of [-0.85, 0.85]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.4, 12), colMat);
    col.position.set(cx, 1.2, 1.45);
    g.add(col);
    const capital = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), colMat);
    capital.position.set(cx, 2.49, 1.45);
    g.add(capital);
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.38), colMat), { position: new THREE.Vector3(cx, 0.08, 1.45) }));
  }

  // Windows
  [-1.2, 0, 1.2].forEach(wx => {
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.85, 0.1), trimMat), { position: new THREE.Vector3(wx, 2.28, 1.41) }));
    const winMat = gm(0xaaddff, 0xffdd88, 0.8);
    nightMats.push(winMat);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.1), winMat);
    win.position.set(wx, 2.28, 1.44);
    g.add(win);
  });
  for (const wx of [-1.3, 1.3]) {
    const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.62, 0.1), gm(0xaaddff, 0xffdd88, 0.8));
    win2.position.set(wx, 1.08, 1.41);
    nightMats.push(win2.material as THREE.MeshLambertMaterial);
    g.add(win2);
  }

  // Awning
  const awningColors = [0xcc2222, 0xfff0cc, 0xcc2222];
  for (let i = 0; i < 3; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.09, 0.75), new THREE.MeshLambertMaterial({ color: awningColors[i] }));
    strip.position.set(-0.7 + i * 0.7, 1.06, 1.77);
    strip.rotation.x = -0.2;
    g.add(strip);
  }

  const signMat = gm(0xcc2222, 0xff1111, 1.2);
  nightMats.push(signMat);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.55, 0.16), signMat);
  sign.position.set(0, 3.1, 1.44);
  g.add(sign);
  nightMats.push(...addBulbs(g, 8, (i) => [-1.4 + i * 0.4, 3.1, 1.54], [0xffdd00, 0xff8800]));

  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.8 - s * 0.25, 0.14, 0.3 + s * 0.02), trimMat);
    step.position.set(0, 0.07 + s * 0.14, 1.55 + s * 0.28);
    g.add(step);
  }

  const doorMat2 = new THREE.MeshLambertMaterial({ color: 0x3a2010 });
  for (const dx of [-0.22, 0.22]) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.1), doorMat2);
    door.position.set(dx, 0.67, 1.43);
    g.add(door);
    const dGlass = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.05), gm(0xaaddff, 0xffdd88, 0.5));
    dGlass.position.set(dx, 0.72, 1.46);
    nightMats.push(dGlass.material as THREE.MeshLambertMaterial);
    g.add(dGlass);
  }

  // Potted plants
  const potMat = new THREE.MeshLambertMaterial({ color: 0x996633 });
  for (const px of [-1.55, 1.55]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.38, 10), potMat);
    pot.position.set(px, 0.19, 1.45);
    g.add(pot);
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshLambertMaterial({ color: 0x228833 }));
    plant.position.set(px, 0.58, 1.45);
    g.add(plant);
  }

  nightMats.push(...addBulbs(g, 10, (i) => [-1.9 + i * 0.42, 3.46, 1.56], [0xffdd44, 0xff6644, 0xffaa00, 0xff4444, 0xffee88]));

  container.add(g);
  const animator: Animator = () => {};
  return { animator, clickTargets: [body], burstColor: 0xffee55, nightMaterials: nightMats };
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export function buildShop(container: THREE.Object3D, shop: PlacedShop): BuildResult {
  switch (shop.type) {
    case "foodStall":  return buildFoodStall(container, shop.x, shop.z);
    case "cafe":       return buildCafe(container, shop.x, shop.z);
    case "restaurant": return buildRestaurant(container, shop.x, shop.z);
  }
}

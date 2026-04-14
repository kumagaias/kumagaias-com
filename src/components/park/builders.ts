import * as THREE from "three";
import type { PlacedAttraction } from "./types";

export type Animator = (t: number) => void;

export interface BuildResult {
  animator: Animator;
  clickTargets: THREE.Object3D[];
  burstColor: number;
  /** Materials that should glow at night. emissiveIntensity starts at 0; ParkScene sets it dynamically. */
  nightMaterials: THREE.MeshLambertMaterial[];
}

/**
 * Create a material that glows at night.
 * emissiveIntensity is 0 by default — ParkScene will scale it by nightFactor.
 * userData.ni stores the target intensity so ParkScene can restore it.
 */
function gm(color: number, emissive: number, intensity = 0.8): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: 0 });
  mat.userData.ni = intensity;
  return mat;
}

/** Add a row of small bulbs; returns their materials for night tracking. */
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
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), mat);
    bulb.position.set(bx, by, bz);
    parent.add(bulb);
    mats.push(mat);
  }
  return mats;
}

// ── Ferris Wheel ─────────────────────────────────────────────────────────────

function buildFerrisWheel(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(x, 0, z);

  const R = 4.5;
  const CY = R;
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xcc4444 });
  const ringMat = gm(0xffdd00, 0xffbb00, 0.3);
  nightMats.push(ringMat);

  [[-1.4, 0], [1.4, 0], [0, -1.0], [0, 1.0]].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, CY * 2 + 0.1), poleMat);
    pole.position.set(px, CY, pz as number);
    wheelGroup.add(pole);
  });
  for (const hy of [CY * 0.38, CY * 0.75]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.1), poleMat);
    b.position.set(0, hy, 0);
    wheelGroup.add(b);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.2), poleMat);
    b2.position.set(0, hy, 0);
    wheelGroup.add(b2);
  }

  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.16, 10, 64), ringMat);
  ring.position.set(0, CY, 0);
  wheelGroup.add(ring);
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 24), ringMat);
  hubRing.position.set(0, CY, 0);
  wheelGroup.add(hubRing);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, R - 0.6), ringMat);
    spoke.position.set(0, CY, 0);
    spoke.rotation.z = angle + Math.PI / 2;
    spoke.translateY((R - 0.6) / 2);
    wheelGroup.add(spoke);
  }

  const ledGroup = new THREE.Group();
  ledGroup.position.set(0, CY, 0);
  wheelGroup.add(ledGroup);
  const ledColors = [0xff4444, 0xff9900, 0xffff00, 0x44ff88, 0x44ddff, 0xaa44ff, 0xff44cc, 0xffffff];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const mat = gm(ledColors[i % 8], ledColors[i % 8], 2.5);
    nightMats.push(mat);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), mat);
    led.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.2);
    ledGroup.add(led);
  }

  const finialMat = gm(0xffdd00, 0xffaa00, 1.2);
  nightMats.push(finialMat);
  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), finialMat);
  finial.position.set(0, CY * 2 + 0.55, 0);
  wheelGroup.add(finial);

  const boothMat = new THREE.MeshLambertMaterial({ color: 0xdd8844 });
  const roofMat  = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.6), boothMat);
  booth.position.set(0, 0.8, 1.6);
  wheelGroup.add(booth);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.8, 4), roofMat);
  roof.position.set(0, 2.0 + 0.4, 1.6);
  roof.rotation.y = Math.PI / 4;
  wheelGroup.add(roof);
  for (const wx of [-0.55, 0.55]) {
    const winMat = gm(0xaaddff, 0xffdd88, 0.6);
    nightMats.push(winMat);
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.08), winMat);
    w.position.set(wx, 1.0, 2.41);
    wheelGroup.add(w);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.08), new THREE.MeshLambertMaterial({ color: 0x5c3b1e }));
  door.position.set(0, 0.55, 2.41);
  wheelGroup.add(door);

  const gondolaColors = [0xff6699, 0x66ccff, 0xffaa33, 0x99ff66, 0xcc66ff, 0xff4444, 0x44ffee, 0xffee44];
  const gondolas: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const gondola = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.48), new THREE.MeshLambertMaterial({ color: gondolaColors[i] }));
    gondola.position.set(x + Math.cos(angle) * R, CY + Math.sin(angle) * R, z);
    const gWinMat = gm(0xaaddff, 0xffdd88, 0.5);
    nightMats.push(gWinMat);
    const gWin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.08), gWinMat);
    gWin.position.set(0, 0.06, 0.28);
    gondola.add(gWin);
    gondolas.push(gondola);
    container.add(gondola);
  }
  container.add(wheelGroup);

  const animator: Animator = (t) => {
    ring.rotation.z += 0.005;
    hubRing.rotation.z += 0.005;
    ledGroup.rotation.z += 0.005;
    finial.rotation.y += 0.02;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t * 0.005 * Math.PI * 2;
      gondolas[i].position.set(x + Math.cos(angle) * R, CY + Math.sin(angle) * R, z);
      gondolas[i].rotation.z = -angle;
    }
  };
  return { animator, clickTargets: [ring, ...gondolas], burstColor: 0xffdd00, nightMaterials: nightMats };
}

// ── Roller Coaster ────────────────────────────────────────────────────────────

function buildRollerCoaster(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const coasterGroup = new THREE.Group();
  coasterGroup.position.set(x, 0, z);

  const trackMat   = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const supportMat = new THREE.MeshLambertMaterial({ color: 0xf5a623 });
  const stationMat = new THREE.MeshLambertMaterial({ color: 0xd4904a });
  const roofMat    = new THREE.MeshLambertMaterial({ color: 0xcc2222 });

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const u = (i / 80) * Math.PI * 2;
    const rx = 6, rz = 4;
    const lift = Math.max(0, Math.cos(u) * 3.5);
    const bunny = Math.sin(u * 3) * 0.8;
    const loop = u > Math.PI * 0.8 && u < Math.PI * 1.2
      ? Math.sin((u - Math.PI * 0.8) / 0.4 * Math.PI) * 3.5 : 0;
    pts.push(new THREE.Vector3(Math.cos(u) * rx, 1.2 + lift + bunny + loop, Math.sin(u) * rz));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  coasterGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.09, 6, true), trackMat));
  for (const off of [-0.18, 0.18]) {
    const rp = pts.map(p => new THREE.Vector3(p.x + off, p.y + 0.14, p.z));
    coasterGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp, true), 200, 0.03, 4, true), trackMat));
  }

  for (let i = 0; i < 28; i++) {
    const pt = curve.getPoint(i / 28);
    if (pt.y < 1.5) continue;
    const h = pt.y - 0.05;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 5), supportMat);
    pillar.position.set(pt.x, h / 2, pt.z);
    coasterGroup.add(pillar);
  }

  coasterGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.4), stationMat), { position: new THREE.Vector3(-5.5, 0.1, 0) }));
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.12), stationMat);
  wall.position.set(-5.5, 0.7, -0.7);
  coasterGroup.add(wall);
  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 1.4), stationMat);
  sideWall.position.set(-6.9, 0.7, 0);
  coasterGroup.add(sideWall);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.6), roofMat);
  roof.position.set(-5.5, 1.5, 0);
  coasterGroup.add(roof);

  for (const wx of [-6.1, -4.9]) {
    const swm = gm(0xaaddff, 0xffdd88, 0.7);
    nightMats.push(swm);
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.1), swm);
    sw.position.set(wx, 0.85, -0.65);
    coasterGroup.add(sw);
  }
  const signMat = gm(0xff2222, 0xff4400, 1.0);
  nightMats.push(signMat);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.12), signMat);
  sign.position.set(-5.5, 1.72, -0.62);
  coasterGroup.add(sign);

  for (const [sx, sz] of [[-6.9, -0.6], [-6.9, 0.6], [-4.1, -0.6], [-4.1, 0.6]] as [number, number][]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 5), supportMat);
    post.position.set(sx, 0.7, sz);
    coasterGroup.add(post);
  }
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.08), new THREE.MeshLambertMaterial({ color: 0xffd700 }));
  barrier.position.set(-5.5, 0.5, 0.7);
  coasterGroup.add(barrier);

  const cartColors = [0xff2200, 0xff5500, 0xff8800];
  const carts = [0, 0.035, 0.07].map((offset, i) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 0.45), new THREE.MeshLambertMaterial({ color: cartColors[i] }));
    body.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.44), new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 })), { position: new THREE.Vector3(0.22, 0.1, 0) }));
    if (i === 0) {
      const hlm = gm(0xffffff, 0xffffff, 3.0);
      nightMats.push(hlm);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), hlm);
      hl.position.set(0.38, 0.05, 0);
      body.add(hl);
    }
    coasterGroup.add(body);
    return { body, offset };
  });
  container.add(coasterGroup);

  const speed = 0.032;
  const animator: Animator = (t) => {
    carts.forEach(({ body, offset }) => {
      const u = ((t * speed) + offset) % 1;
      const pos = curve.getPoint(u);
      body.position.copy(pos);
      body.lookAt(pos.clone().add(curve.getTangent(u)));
    });
  };
  return { animator, clickTargets: carts.map(c => c.body), burstColor: 0xff4400, nightMaterials: nightMats };
}

// ── Coffee Cups ───────────────────────────────────────────────────────────────

function buildCoffeeCups(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const cupGroup = new THREE.Group();
  cupGroup.position.set(x, 0, z);

  cupGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.18, 40), new THREE.MeshLambertMaterial({ color: 0xdd77ff })));
  cupGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.08, 40), new THREE.MeshLambertMaterial({ color: 0xffffff })));

  const colMat = gm(0xff88ff, 0xff44ff, 0.8);
  nightMats.push(colMat);
  const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 16), colMat);
  colBase.position.y = 0.2;
  cupGroup.add(colBase);
  const colMid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 1.2, 16), colMat);
  colMid.position.y = 1.0;
  cupGroup.add(colMid);
  const topMat = gm(0xffdd00, 0xffbb00, 1.2);
  nightMats.push(topMat);
  const colTop = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), topMat);
  colTop.position.y = 1.85;
  cupGroup.add(colTop);

  nightMats.push(...addBulbs(cupGroup, 12,
    (i) => { const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 2.5, 0.22, Math.sin(a) * 2.5]; },
    [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88, 0xff8800, 0xcc44ff, 0x44ffee, 0xff4444]));

  const cupColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88];
  const cups: { outer: THREE.Group; inner: THREE.Group }[] = [];
  const cupMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const outer = new THREE.Group();
    outer.position.set(Math.cos(angle) * 1.4, 0.18, Math.sin(angle) * 1.4);
    const inner = new THREE.Group();
    const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.55, 18), new THREE.MeshLambertMaterial({ color: cupColors[i] }));
    cupMesh.position.y = 0.28;
    inner.add(cupMesh);
    inner.add(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.07, 18), new THREE.MeshLambertMaterial({ color: 0xffffff })));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: cupColors[i] }));
    handle.position.set(0.38, 0.35, 0);
    handle.rotation.z = -Math.PI / 2;
    inner.add(handle);
    outer.add(inner);
    cupGroup.add(outer);
    cups.push({ outer, inner });
    cupMeshes.push(cupMesh);
  }
  container.add(cupGroup);

  const animator: Animator = (t) => {
    cupGroup.rotation.y += 0.008;
    cups.forEach((c, i) => {
      c.outer.rotation.y = t * 0.5 * (i % 2 === 0 ? 1 : -1);
      c.inner.rotation.y = t * 1.2 * (i % 2 === 0 ? -1 : 1);
    });
  };
  return { animator, clickTargets: cupMeshes, burstColor: 0xee88ff, nightMaterials: nightMats };
}

// ── Merry-Go-Round ────────────────────────────────────────────────────────────

function buildMerryGoRound(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const merryGroup = new THREE.Group();
  merryGroup.position.set(x, 0, z);

  // Base step
  const step = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 0.12, 48),
    new THREE.MeshLambertMaterial({ color: 0xffccdd }),
  );
  step.position.y = 0.06;
  merryGroup.add(step);

  // Platform
  const platformMat = new THREE.MeshLambertMaterial({ color: 0xffddee });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.22, 48), platformMat);
  platform.position.y = 0.23;
  merryGroup.add(platform);
  // Decorative concentric rings on platform surface
  for (let r = 0; r < 4; r++) {
    const deco = new THREE.Mesh(
      new THREE.TorusGeometry(2.8 - r * 0.65, 0.055, 4, 48),
      new THREE.MeshLambertMaterial({ color: r % 2 === 0 ? 0xff88bb : 0xffffff }),
    );
    deco.rotation.x = Math.PI / 2;
    deco.position.y = 0.345;
    merryGroup.add(deco);
  }
  // Rim trim
  const rimTrim = new THREE.Mesh(
    new THREE.TorusGeometry(3.0, 0.12, 6, 48),
    new THREE.MeshLambertMaterial({ color: 0xff55aa }),
  );
  rimTrim.rotation.x = Math.PI / 2;
  rimTrim.position.y = 0.23;
  merryGroup.add(rimTrim);

  // Center pole — runs from platform top to canopy base
  const poleH = 6.2;
  const poleBaseY = 0.34;
  const canopyBaseY = poleBaseY + poleH; // = 6.54
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, poleH, 12),
    new THREE.MeshLambertMaterial({ color: 0xffd700 }),
  );
  pole.position.y = poleBaseY + poleH / 2;
  merryGroup.add(pole);
  // Spiral rings on center pole
  for (let r = 0; r < 10; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 6, 14),
      new THREE.MeshLambertMaterial({ color: r % 2 === 0 ? 0xff4488 : 0xffffff }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = poleBaseY + 0.5 + r * 0.58;
    merryGroup.add(ring);
  }

  // 8 outer support poles at radius 2.7 — tops meet canopy rim at canopyBaseY
  const outerR = 2.7;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const outerPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, poleH, 8),
      new THREE.MeshLambertMaterial({ color: 0xffc040 }),
    );
    outerPole.position.set(Math.cos(a) * outerR, poleBaseY + poleH / 2, Math.sin(a) * outerR);
    merryGroup.add(outerPole);
    // Decorative ball cap on each outer pole top
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xffee55 }),
    );
    cap.position.set(Math.cos(a) * outerR, canopyBaseY + 0.08, Math.sin(a) * outerR);
    merryGroup.add(cap);
  }

  // ── Canopy — two-tier roof ──────────────────────────────────────────────────
  // Lower tier outer cone
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(3.6, 1.9, 24),
    new THREE.MeshLambertMaterial({ color: 0xff55aa }),
  );
  canopy.position.y = canopyBaseY + 0.95;
  merryGroup.add(canopy);
  // Lower tier valance (inner cone, lighter)
  const innerCone = new THREE.Mesh(
    new THREE.ConeGeometry(3.0, 1.2, 24),
    new THREE.MeshLambertMaterial({ color: 0xffbbdd }),
  );
  innerCone.position.y = canopyBaseY + 0.5;
  merryGroup.add(innerCone);
  // Lower tier rim torus
  const canopyRim = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.13, 6, 48),
    new THREE.MeshLambertMaterial({ color: 0xff33aa }),
  );
  canopyRim.rotation.x = Math.PI / 2;
  canopyRim.position.y = canopyBaseY;
  merryGroup.add(canopyRim);

  // Upper tier outer cone
  const canopy2 = new THREE.Mesh(
    new THREE.ConeGeometry(2.1, 1.5, 24),
    new THREE.MeshLambertMaterial({ color: 0xff33aa }),
  );
  canopy2.position.y = canopyBaseY + 2.65;
  merryGroup.add(canopy2);
  // Upper tier valance
  const innerCone2 = new THREE.Mesh(
    new THREE.ConeGeometry(1.7, 0.95, 24),
    new THREE.MeshLambertMaterial({ color: 0xffbbdd }),
  );
  innerCone2.position.y = canopyBaseY + 2.32;
  merryGroup.add(innerCone2);
  // Upper tier rim torus
  const canopyRim2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.11, 6, 48),
    new THREE.MeshLambertMaterial({ color: 0xff33aa }),
  );
  canopyRim2.rotation.x = Math.PI / 2;
  canopyRim2.position.y = canopyBaseY + 1.9;
  merryGroup.add(canopyRim2);

  // Pennant flags — lower tier (24 flags)
  const flagColors = [0xffee00, 0xff4422, 0x4488ff, 0x44cc44, 0xff44bb, 0xffffff];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.38, 3),
      new THREE.MeshLambertMaterial({ color: flagColors[i % 6] }),
    );
    flag.position.set(Math.cos(a) * 3.6, canopyBaseY - 0.19, Math.sin(a) * 3.6);
    flag.rotation.z = Math.PI;
    merryGroup.add(flag);
  }
  // Pennant flags — upper tier (12 flags)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const flag = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.30, 3),
      new THREE.MeshLambertMaterial({ color: flagColors[i % 6] }),
    );
    flag.position.set(Math.cos(a) * 2.1, canopyBaseY + 1.71, Math.sin(a) * 2.1);
    flag.rotation.z = Math.PI;
    merryGroup.add(flag);
  }

  // Hanging crystal ornaments from lower rim
  const crystalColors = [0xffeeaa, 0xaaffee, 0xffaaee, 0xaaccff, 0xffddaa, 0xeeffcc];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.11),
      new THREE.MeshLambertMaterial({ color: crystalColors[i % 6] }),
    );
    crystal.position.set(Math.cos(a) * 3.3, canopyBaseY - 0.48, Math.sin(a) * 3.3);
    merryGroup.add(crystal);
  }

  // Top spire + ornament ball
  const topBallMat = gm(0xffdd00, 0xffaa00, 1.5);
  nightMats.push(topBallMat);
  const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), topBallMat);
  topBall.position.y = canopyBaseY + 4.26;
  merryGroup.add(topBall);
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xffd700 }),
  );
  spire.position.y = canopyBaseY + 4.96;
  merryGroup.add(spire);
  // Mid ornament ball between tiers
  const midBallMat = gm(0xff88cc, 0xff44aa, 1.2);
  nightMats.push(midBallMat);
  const midBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), midBallMat);
  midBall.position.y = canopyBaseY + 1.9;
  merryGroup.add(midBall);

  // Night bulbs — lower rim
  nightMats.push(...addBulbs(merryGroup, 24,
    (i) => { const a = (i / 24) * Math.PI * 2; return [Math.cos(a) * 3.62, canopyBaseY + 0.07, Math.sin(a) * 3.62]; },
    [0xff4488, 0xffcc00, 0x44aaff, 0xff8800, 0x44ff88, 0xcc44ff]));
  // Night bulbs — upper rim
  nightMats.push(...addBulbs(merryGroup, 12,
    (i) => { const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 2.12, canopyBaseY + 1.97, Math.sin(a) * 2.12]; },
    [0xffffff, 0xffeeaa]));
  // Night bulbs — outer pole caps
  nightMats.push(...addBulbs(merryGroup, 8,
    (i) => { const a = (i / 8) * Math.PI * 2; return [Math.cos(a) * outerR, canopyBaseY + 0.22, Math.sin(a) * outerR]; },
    [0xffeecc, 0xffffff]));

  // ── Unicorn horses — 6 outer + 2 inner carriages ───────────────────────────
  const horseColors = [0xffffff, 0xffcc88, 0xaaddff, 0xffaacc, 0xaaffaa, 0xffddaa, 0xddbbff, 0xffeedd];
  const maneColors  = [0xff88cc, 0xff6699, 0xcc88ff, 0xff9944, 0x88ddff, 0xffcc44, 0xff88aa, 0xaaffcc];
  const horses: { group: THREE.Group; baseY: number; phase: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const hx = Math.cos(angle) * 1.9;
    const hz = Math.sin(angle) * 1.9;

    // Fixed horse pole (reaches from platform to canopy)
    const horsePole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, poleH, 8),
      new THREE.MeshLambertMaterial({ color: 0xdddddd }),
    );
    horsePole.position.set(hx, poleBaseY + poleH / 2, hz);
    merryGroup.add(horsePole);

    // Animated horse group (slides on pole)
    const hg = new THREE.Group();
    hg.position.set(hx, 0.7, hz);
    const hMat = new THREE.MeshLambertMaterial({ color: horseColors[i] });
    // Body
    const hbody = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.36, 0.27), hMat);
    hbody.position.y = 0.9;
    hg.add(hbody);
    // Neck
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.34, 0.19), hMat);
    neck.position.set(0.31, 1.12, 0);
    neck.rotation.z = -0.3;
    hg.add(neck);
    // Head
    const hhead = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.23, 0.20), hMat);
    hhead.position.set(0.46, 1.30, 0);
    hg.add(hhead);
    // Horn (unicorn)
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.36, 6),
      new THREE.MeshLambertMaterial({ color: 0xffd700 }),
    );
    horn.position.set(0.57, 1.50, 0);
    horn.rotation.z = -0.5;
    hg.add(horn);
    // Eye
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0x222222 }),
    );
    eye.position.set(0.60, 1.31, 0.09);
    hg.add(eye);
    // Mane
    const mane = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.15, 0.10),
      new THREE.MeshLambertMaterial({ color: maneColors[i] }),
    );
    mane.position.set(0.29, 1.44, 0);
    hg.add(mane);
    // Legs (4)
    for (const [lx, lz] of [[-0.22, 0.09], [0.22, 0.09], [-0.22, -0.09], [0.22, -0.09]] as [number, number][]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.44, 0.09), hMat);
      leg.position.set(lx, 0.60, lz);
      hg.add(leg);
    }
    // Tail
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.10, 0.40, 6),
      new THREE.MeshLambertMaterial({ color: maneColors[i] }),
    );
    tail.position.set(-0.38, 0.90, 0);
    tail.rotation.z = Math.PI / 2 + 0.4;
    hg.add(tail);
    // Saddle
    const saddle = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.11, 0.29),
      new THREE.MeshLambertMaterial({ color: 0x994422 }),
    );
    saddle.position.set(0, 1.12, 0);
    hg.add(saddle);
    // Gold saddle trim
    const saddleTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.06, 0.08),
      new THREE.MeshLambertMaterial({ color: 0xffd700 }),
    );
    saddleTrim.position.set(0, 1.16, 0.16);
    hg.add(saddleTrim);

    merryGroup.add(hg);
    horses.push({ group: hg, baseY: 0.7, phase: (i / 6) * Math.PI * 2 });
  }

  container.add(merryGroup);

  const animator: Animator = (t) => {
    merryGroup.rotation.y += 0.011;
    horses.forEach((h) => { h.group.position.y = h.baseY + Math.sin(t * 2 + h.phase) * 0.38; });
  };
  const horseMeshes = horses.map(h => h.group.children[0] as THREE.Mesh);
  return { animator, clickTargets: [canopy, ...horseMeshes], burstColor: 0xff66aa, nightMaterials: nightMats };
}

// ── Shooting Gallery ──────────────────────────────────────────────────────────

function buildShootingGallery(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 3.4), new THREE.MeshLambertMaterial({ color: 0xd4a96a }));
  floor.position.set(0, 0.07, -0.5);
  g.add(floor);

  const wallMat = new THREE.MeshLambertMaterial({ color: 0x8b5c2a });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 0.22), wallMat);
  backWall.position.set(0, 1.6, -2.1);
  g.add(backWall);
  for (const sx of [-2.5, 2.5]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 3.4), wallMat);
    sw.position.set(sx, 1.6, -0.5);
    g.add(sw);
  }

  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.55), new THREE.MeshLambertMaterial({ color: 0xf0c070 }));
  counter.position.set(0, 1.06, 0.95);
  g.add(counter);
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.06, 0.14), wallMat);
  frontPanel.position.set(0, 0.53, 1.12);
  g.add(frontPanel);

  for (const sx of [-2.4, 2.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 0.24), new THREE.MeshLambertMaterial({ color: 0x6b3a1f }));
    post.position.set(sx, 1.8, 1.02);
    g.add(post);
  }

  const awningColors = [0xff3333, 0xffffff, 0xff3333, 0xffffff, 0xff3333];
  for (let i = 0; i < 5; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.09, 1.7), new THREE.MeshLambertMaterial({ color: awningColors[i] }));
    strip.position.set(-2.05 + i * 1.02, 3.45, 0.15);
    strip.rotation.x = 0.28;
    g.add(strip);
  }
  for (let i = 0; i < 11; i++) {
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.07), new THREE.MeshLambertMaterial({ color: 0xff3333 }));
    fringe.position.set(-2.3 + i * 0.46, 2.98, 0.9);
    g.add(fringe);
  }

  const signMat = gm(0xffee22, 0xffcc00, 1.2);
  nightMats.push(signMat);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.58, 0.2), signMat);
  sign.position.set(0, 3.75, 0.88);
  g.add(sign);

  const dotColors2 = [0xff3333, 0x33aaff, 0x33dd33, 0xff9900, 0xff33aa];
  nightMats.push(...addBulbs(g, 7, (i) => [-1.8 + i * 0.6, 3.75, 1.0], dotColors2));
  nightMats.push(...addBulbs(g, 9, (i) => [-2.1 + i * 0.52, 3.55, 1.05], [0xff4444, 0xffcc00, 0x44aaff, 0x44ff88, 0xff88ff]));

  for (const sy of [1.65, 2.25]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.09, 0.3), new THREE.MeshLambertMaterial({ color: 0xbb8833 }));
    shelf.position.set(0, sy, -2.0);
    g.add(shelf);
  }

  const canColors = [0xff3333, 0x3388ff, 0x33cc33, 0xffaa00, 0xcc33cc, 0x33dddd, 0xff6666];
  const targets: { mesh: THREE.Mesh; fallen: boolean; resetT: number; baseY: number }[] = [];
  for (let row = 0; row < 2; row++) {
    const sy = 1.75 + row * 0.6;
    for (let col = 0; col < 7; col++) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 12), new THREE.MeshLambertMaterial({ color: canColors[(col + row * 3) % canColors.length] }));
      can.position.set(-1.5 + col * 0.52, sy, -1.95);
      g.add(can);
      targets.push({ mesh: can, fallen: false, resetT: 0, baseY: sy });
    }
  }

  for (let i = 0; i < 4; i++) {
    const c = new THREE.MeshLambertMaterial({ color: [0xff88aa, 0x88aaff, 0xffdd44, 0xaaffaa][i] });
    const pbody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), c);
    pbody.position.set(-1.5 + i * 1.0, 2.76, -2.02);
    g.add(pbody);
    const phead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), c);
    phead.position.set(-1.5 + i * 1.0, 3.04, -2.02);
    g.add(phead);
  }

  const starMat = gm(0xffee00, 0xffcc00, 1.5);
  nightMats.push(starMat);
  for (let i = 0; i < 4; i++) {
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), starMat);
    star.position.set(-1.5 + i * 1.0, 3.15, 0.98);
    g.add(star);
  }

  container.add(g);
  let t2 = 0;
  const animator: Animator = () => {
    t2 += 0.04;
    g.children.forEach(c => {
      if (c instanceof THREE.Mesh && c.geometry instanceof THREE.OctahedronGeometry) {
        c.rotation.y = t2 * 1.2;
        c.position.y = 3.15 + Math.sin(t2 + c.position.x) * 0.05;
      }
    });
    targets.forEach((tgt) => {
      if (tgt.fallen) {
        tgt.mesh.rotation.z = Math.PI / 2;
        tgt.resetT -= 0.016;
        if (tgt.resetT <= 0) { tgt.fallen = false; tgt.mesh.rotation.z = 0; }
      }
    });
  };
  return { animator, clickTargets: targets.map(t => t.mesh), burstColor: 0xffee00, nightMaterials: nightMats };
}

// ── Mini Train ────────────────────────────────────────────────────────────────

function buildMiniTrain(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const trainGroup = new THREE.Group();
  trainGroup.position.set(x, 0, z);

  const rx = 6, rz = 4;
  const trackPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    trackPoints.push(new THREE.Vector3(Math.cos(a) * rx, 0.05, Math.sin(a) * rz));
  }
  const trainCurve = new THREE.CatmullRomCurve3(trackPoints, true);

  const railMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  for (const off of [-0.2, 0.2]) {
    const rp = trackPoints.map(p => new THREE.Vector3(p.x + off, p.y, p.z));
    trainGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp, true), 128, 0.045, 4, true), railMat));
  }
  const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  for (let i = 0; i < 48; i++) {
    const pt = trainCurve.getPoint(i / 48);
    const tang = trainCurve.getTangent(i / 48);
    const slp = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.07, 0.14), sleeperMat);
    slp.position.copy(pt);
    slp.lookAt(pt.clone().add(tang));
    trainGroup.add(slp);
  }
  trainGroup.add(new THREE.Mesh(new THREE.TubeGeometry(trainCurve, 128, 0.28, 4, true), new THREE.MeshLambertMaterial({ color: 0xbbaa99, transparent: true, opacity: 0.5 })));

  const statMat = new THREE.MeshLambertMaterial({ color: 0xfff0cc });
  const roofMat2 = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 1.6), statMat);
  platform.position.set(-rx, 0.1, 0);
  trainGroup.add(platform);
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  for (const fz of [-0.7, 0.7]) {
    const fence = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 0.06), fenceMat);
    fence.position.set(-rx, 0.38, fz);
    trainGroup.add(fence);
    for (let fi = -1.7; fi <= 1.8; fi += 0.5) {
      const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 4), fenceMat);
      fp.position.set(-rx + fi, 0.25, fz);
      trainGroup.add(fp);
    }
  }
  const statRoof = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 1.8), roofMat2);
  statRoof.position.set(-rx, 1.55, 0);
  trainGroup.add(statRoof);
  for (const [px, pz] of [[-rx - 1.8, -0.7], [-rx - 1.8, 0.7], [-rx + 1.8, -0.7], [-rx + 1.8, 0.7]] as [number, number][]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.45, 5), new THREE.MeshLambertMaterial({ color: 0xcc9955 }));
    post.position.set(px, 0.72, pz);
    trainGroup.add(post);
  }
  const ssignMat = gm(0x3355ff, 0x2244ff, 1.0);
  nightMats.push(ssignMat);
  const ssign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 0.12), ssignMat);
  ssign.position.set(-rx, 1.76, -0.88);
  trainGroup.add(ssign);
  nightMats.push(...addBulbs(trainGroup, 5, (i) => [-rx - 1.2 + i * 0.6, 1.48, -0.88], [0xffdd88, 0xffffff]));

  const carColors = [0xcc2200, 0x3355cc, 0x228822, 0xcc7700];
  const trainCars: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const isLoco = i === 0;
    const body = new THREE.Mesh(new THREE.BoxGeometry(isLoco ? 0.95 : 0.78, isLoco ? 0.58 : 0.48, 0.58), new THREE.MeshLambertMaterial({ color: carColors[i] }));
    if (isLoco) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.56), new THREE.MeshLambertMaterial({ color: carColors[0] }));
      cab.position.set(-0.18, 0.28, 0);
      body.add(cab);
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.28, 8), new THREE.MeshLambertMaterial({ color: 0x222222 }));
      chimney.position.set(0.32, 0.38, 0);
      body.add(chimney);
      const hlm = gm(0xffffff, 0xffffff, 3.0);
      nightMats.push(hlm);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), hlm);
      hl.position.set(0.5, 0.05, 0);
      body.add(hl);
    }
    const winMat = gm(0xaaddff, 0xffdd88, 0.6);
    nightMats.push(winMat);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.59), winMat);
    win.position.set(-0.14, 0.1, 0);
    body.add(win);
    container.add(body);
    trainCars.push(body);
  }
  container.add(trainGroup);

  const smokeMat = new THREE.MeshLambertMaterial({ color: 0xdddddd, transparent: true, opacity: 0.5 });
  const smokePuffs = Array.from({ length: 6 }, () => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 5, 4), smokeMat.clone() as THREE.MeshLambertMaterial);
    container.add(s);
    return s;
  });

  const animator: Animator = (t) => {
    for (let i = 0; i < 4; i++) {
      const offset = ((t * 0.025 + i * 0.055) % 1 + 1) % 1;
      const tp = trainCurve.getPoint(offset).add(trainGroup.position);
      const tt = trainCurve.getTangent(offset);
      trainCars[i].position.copy(tp);
      trainCars[i].position.y = 0.32;
      trainCars[i].lookAt(tp.clone().add(tt));
    }
    smokePuffs.forEach((s, i) => {
      const age = ((t * 0.6 + i * 0.18) % 1);
      const locoFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(trainCars[0].quaternion);
      s.position.copy(trainCars[0].position).addScaledVector(locoFwd, 0.38);
      s.position.y = 0.75 + age * 2.5;
      s.position.x += Math.sin(t + i) * 0.07;
      (s.material as THREE.MeshLambertMaterial).opacity = 0.45 * (1 - age);
      const sc = 0.5 + age * 1.5;
      s.scale.set(sc, sc, sc);
    });
  };
  return { animator, clickTargets: trainCars, burstColor: 0xff4400, nightMaterials: nightMats };
}

// ── Drop Tower ────────────────────────────────────────────────────────────────

function buildDropTower(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const dropGroup = new THREE.Group();
  dropGroup.position.set(x, 0, z);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 9, 12), new THREE.MeshLambertMaterial({ color: 0xaaaaaa }));
  pillar.position.y = 4.5;
  dropGroup.add(pillar);

  const warnColors = [0xff2244, 0xff8800, 0xffee00];
  for (let i = 0; i < 5; i++) {
    const rMat = gm(warnColors[i % 3], warnColors[i % 3], 1.0);
    nightMats.push(rMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.1, 6, 24), rMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.5 + i * 1.5;
    dropGroup.add(ring);
  }

  const legMat = new THREE.MeshLambertMaterial({ color: 0xf5a623 });
  for (const la of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6), legMat);
    leg.position.set(Math.cos(la) * 1.0, 3.0, Math.sin(la) * 1.0);
    leg.rotation.z = -Math.cos(la) * 0.22;
    leg.rotation.x = Math.sin(la) * 0.22;
    dropGroup.add(leg);
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.5), legMat);
    brace.position.set(Math.cos(la) * 0.5, 1.5, Math.sin(la) * 0.5);
    brace.rotation.z = -Math.cos(la) * 0.4;
    brace.rotation.x = Math.sin(la) * 0.4;
    dropGroup.add(brace);
  }

  const capMat = gm(0xff2244, 0xff0033, 0.8);
  nightMats.push(capMat);
  const topCap = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 12), capMat);
  topCap.position.y = 9.7;
  dropGroup.add(topCap);
  nightMats.push(...addBulbs(dropGroup, 8,
    (i) => { const a = (i / 8) * Math.PI * 2; return [Math.cos(a) * 0.65, 9.1, Math.sin(a) * 0.65]; },
    [0xff4444, 0xff8800, 0xffdd00, 0x44ffee]));

  const ringMat = gm(0xff8800, 0xff6600, 0.5);
  nightMats.push(ringMat);
  const dropRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.16, 8, 28), ringMat);
  dropRing.position.y = 1;
  dropGroup.add(dropRing);

  const dropSeatColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88, 0xcc44ff, 0xff8844];
  const dropSeatMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.24), new THREE.MeshLambertMaterial({ color: dropSeatColors[i] }));
    seat.position.set(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9);
    dropRing.add(seat);
    dropSeatMeshes.push(seat);
  }
  container.add(dropGroup);

  const animator: Animator = (t) => {
    const dropPhase = (t * 0.35) % 1;
    dropRing.position.y = dropPhase < 0.6
      ? 1 + (dropPhase / 0.6) * 7
      : 8 - ((dropPhase - 0.6) / 0.4) ** 2 * 7;
    dropRing.rotation.y += 0.015;
  };
  return { animator, clickTargets: [dropRing, ...dropSeatMeshes], burstColor: 0xff8800, nightMaterials: nightMats };
}

// ── Swing Carousel ────────────────────────────────────────────────────────────

function buildSwingCarousel(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const swingGroup = new THREE.Group();
  swingGroup.position.set(x, 0, z);

  swingGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.22, 20), new THREE.MeshLambertMaterial({ color: 0x44aaff })));
  (swingGroup.children.at(-1) as THREE.Mesh).position.y = 0.11;
  swingGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 5.2, 14), new THREE.MeshLambertMaterial({ color: 0x44aaff })));
  (swingGroup.children.at(-1) as THREE.Mesh).position.y = 2.6;
  for (let r = 0; r < 4; r++) {
    const pr = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 6, 14), new THREE.MeshLambertMaterial({ color: r % 2 === 0 ? 0xff6644 : 0xffffff }));
    pr.rotation.x = Math.PI / 2;
    pr.position.y = 0.8 + r * 1.1;
    swingGroup.add(pr);
  }

  swingGroup.add(new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.2, 20), new THREE.MeshLambertMaterial({ color: 0xff6644 })));
  (swingGroup.children.at(-1) as THREE.Mesh).position.y = 5.8;
  swingGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.3, 0.35, 20), new THREE.MeshLambertMaterial({ color: 0xffddcc })));
  (swingGroup.children.at(-1) as THREE.Mesh).position.y = 5.2;

  const pennantMat = gm(0xffdd00, 0xffbb00, 1.5);
  nightMats.push(pennantMat);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const pf = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.45, 3), pennantMat);
    pf.position.set(Math.cos(a) * 2.55, 5.2, Math.sin(a) * 2.55);
    pf.rotation.z = Math.PI;
    swingGroup.add(pf);
  }
  const topBallMat = gm(0xffdd00, 0xffaa00, 1.5);
  nightMats.push(topBallMat);
  const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), topBallMat);
  topBall.position.y = 6.45;
  swingGroup.add(topBall);
  nightMats.push(...addBulbs(swingGroup, 12,
    (i) => { const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 2.55, 5.22, Math.sin(a) * 2.55]; },
    [0xff4444, 0xffcc00, 0x44aaff, 0x44ff88, 0xff88ff, 0xff8800]));

  const swingTop = new THREE.Group();
  swingTop.position.y = 5.1;
  const swingArms: THREE.Group[] = [];
  const swingChairColors = [0xff4444, 0x44aaff, 0xffcc00, 0x44ff88, 0xff44aa, 0xaa44ff, 0xff8800, 0x44ffee, 0xff6699, 0x88ff44, 0x66aaff, 0xffdd22];
  const chairMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 12) * Math.PI * 2;
    const arm = new THREE.Group();
    arm.position.set(1.8, 0, 0);
    arm.rotation.z = 0.25;
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 4), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
    chain.position.y = -0.65;
    arm.add(chain);
    const chairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.24), new THREE.MeshLambertMaterial({ color: swingChairColors[i] }));
    chairMesh.position.y = -1.35;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.06), new THREE.MeshLambertMaterial({ color: swingChairColors[i] }));
    back.position.set(0, 0.06, -0.15);
    chairMesh.add(back);
    arm.add(chairMesh);
    pivot.add(arm);
    swingTop.add(pivot);
    swingArms.push(arm);
    chairMeshes.push(chairMesh);
  }
  swingGroup.add(swingTop);
  container.add(swingGroup);

  const animator: Animator = (t) => {
    swingTop.rotation.y += 0.018;
    const lean = 0.24 + Math.sin(t * 0.4) * 0.1;
    swingArms.forEach(a => { a.rotation.z = lean; });
  };
  return { animator, clickTargets: chairMeshes, burstColor: 0xff6644, nightMaterials: nightMats };
}

// ── Bumper Cars ───────────────────────────────────────────────────────────────

function buildBumperCars(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Arena floor
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x334455 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.12, 6.0), floorMat);
  floor.position.y = 0.06;
  g.add(floor);

  // Arena walls (low barriers)
  const barrierMat = new THREE.MeshLambertMaterial({ color: 0xdd3333 });
  const barrierTop = gm(0xffee00, 0xffcc00, 0.8);
  nightMats.push(barrierTop);
  [
    { w: 8.4, d: 0.3, px: 0, pz:  3.15 },
    { w: 8.4, d: 0.3, px: 0, pz: -3.15 },
    { w: 0.3, d: 6.0, px:  4.2, pz: 0 },
    { w: 0.3, d: 6.0, px: -4.2, pz: 0 },
  ].forEach(({ w, d, px, pz }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), barrierMat);
    wall.position.set(px, 0.37, pz);
    g.add(wall);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d + 0.01), barrierTop);
    stripe.position.set(px, 0.65, pz);
    g.add(stripe);
  });

  // Canopy poles + roof
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x556677 });
  const roofMat = gm(0xff4466, 0xff2244, 0.3);
  nightMats.push(roofMat);
  [[-3.5, -2.5], [3.5, -2.5], [-3.5, 2.5], [3.5, 2.5]].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), poleMat);
    pole.position.set(px, 2.25, pz as number);
    g.add(pole);
  });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.12, 6.4), roofMat);
  roof.position.y = 4.56;
  g.add(roof);
  nightMats.push(...addBulbs(g, 12,
    (i) => { const u = i / 12; return [Math.cos(u * Math.PI * 2) * 3.8, 4.5, Math.sin(u * Math.PI * 2) * 2.8]; },
    [0xff4444, 0xffee44, 0x44ffee, 0xff44ff]));

  // Bumper cars (3 cars orbiting the arena)
  const carColors = [0xff3366, 0x3399ff, 0xffcc00];
  const carMeshes: THREE.Mesh[] = [];
  const carOffsets = [0, Math.PI * 2 / 3, Math.PI * 4 / 3];
  carOffsets.forEach((offset, i) => {
    const car = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.7), new THREE.MeshLambertMaterial({ color: carColors[i] }));
    car.position.set(Math.cos(offset) * 2.8, 0.42, Math.sin(offset) * 1.9);
    const bumper = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.1, 6, 16), new THREE.MeshLambertMaterial({ color: 0x888888 }));
    bumper.rotation.x = Math.PI / 2;
    bumper.position.y = -0.1;
    car.add(bumper);
    g.add(car);
    carMeshes.push(car);
  });
  container.add(g);

  const animator: Animator = (t) => {
    carOffsets.forEach((base, i) => {
      const angle = base + t * (i % 2 === 0 ? 0.4 : -0.35);
      const rx = 2.8, rz = 1.9;
      carMeshes[i].position.set(Math.cos(angle) * rx, 0.42, Math.sin(angle) * rz);
      carMeshes[i].rotation.y = -angle + Math.PI / 2;
    });
  };
  return { animator, clickTargets: carMeshes, burstColor: 0xff3366, nightMaterials: nightMats };
}

// ── Haunted House ─────────────────────────────────────────────────────────────

function buildHauntedHouse(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Main building
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x2a1a3a });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x1a0d28 });
  const building = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.5, 4.5), wallMat);
  building.position.y = 2.25;
  g.add(building);

  // Pitched roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.5, 4), roofMat);
  roof.position.y = 5.75;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  // Eerie windows (green glow)
  const winMat = gm(0x44ff88, 0x22ff66, 2.0);
  nightMats.push(winMat);
  [[-1.2, 2.8], [1.2, 2.8], [-1.2, 1.4], [1.2, 1.4]].forEach(([wx, wy]) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.08), winMat);
    win.position.set(wx, wy, 2.29);
    g.add(win);
  });

  // Door
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x3d1e0a });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.08), doorMat);
  door.position.set(0, 0.75, 2.29);
  g.add(door);

  // Fence posts
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
  for (let i = -3; i <= 3; i++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), fenceMat);
    post.position.set(i * 0.8, 0.55, 3.5);
    g.add(post);
    if (i < 3) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), fenceMat);
      rail.position.set(i * 0.8 + 0.4, 0.9, 3.5);
      g.add(rail);
    }
  }

  // Floating ghost
  const ghostMat = gm(0xeeeeff, 0xaabbff, 1.5);
  nightMats.push(ghostMat);
  const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), ghostMat);
  ghost.position.set(0.8, 5.5, 2.8);
  g.add(ghost);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 8), ghostMat);
  tail.rotation.x = Math.PI;
  tail.position.set(0.8, 5.22, 2.8);
  g.add(tail);

  container.add(g);

  const animator: Animator = (t) => {
    const bob = Math.sin(t * 1.2) * 0.4;
    ghost.position.y = 5.5 + bob;
    tail.position.y = 5.22 + bob;
    ghost.rotation.y += 0.03;
    // flicker windows
    const flicker = 0.5 + Math.abs(Math.sin(t * 7.3)) * 0.5;
    winMat.emissiveIntensity = flicker * (winMat.userData.ni as number);
  };
  return { animator, clickTargets: [building, ghost], burstColor: 0x44ff88, nightMaterials: nightMats };
}

// ── Water Slide ───────────────────────────────────────────────────────────────

function buildWaterSlide(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Tower
  const towerMat = new THREE.MeshLambertMaterial({ color: 0x2266cc });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 8.5, 10), towerMat);
  tower.position.y = 4.25;
  g.add(tower);

  // Platform on top
  const platMat = new THREE.MeshLambertMaterial({ color: 0x1144aa });
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 12), platMat);
  plat.position.y = 8.6;
  g.add(plat);

  // Slide (helix-like using curve)
  const slideMat = gm(0x44ccff, 0x22aaff, 0.4);
  nightMats.push(slideMat);
  const helixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const angle = t * Math.PI * 4;
    helixPts.push(new THREE.Vector3(Math.cos(angle) * (1.3 + t * 0.4), 8.5 - t * 8.0, Math.sin(angle) * (1.3 + t * 0.4)));
  }
  const helixCurve = new THREE.CatmullRomCurve3(helixPts);
  const slideTube = new THREE.Mesh(new THREE.TubeGeometry(helixCurve, 80, 0.22, 8, false), slideMat);
  g.add(slideTube);

  // Pool at base
  const poolMat = gm(0x55ddff, 0x33bbff, 0.5);
  nightMats.push(poolMat);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.3, 20), poolMat);
  pool.position.y = 0.15;
  g.add(pool);

  // Stripe lights on tower
  nightMats.push(...addBulbs(g, 8,
    (i) => { const a = (i / 8) * Math.PI * 2; return [Math.cos(a) * 0.72, 2 + i * 0.8, Math.sin(a) * 0.72]; },
    [0x44ddff, 0xffffff, 0x44aaff, 0x88eeff]));

  // Sliding figure
  const figMat = new THREE.MeshLambertMaterial({ color: 0xff8844 });
  const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.3, 4, 8), figMat);
  g.add(fig);
  container.add(g);

  const animator: Animator = (t) => {
    const phase = (t * 0.25) % 1;
    const pt = helixCurve.getPoint(phase);
    fig.position.copy(pt);
    const tan = helixCurve.getTangent(phase);
    fig.lookAt(pt.clone().add(tan));
  };
  return { animator, clickTargets: [tower, pool, slideTube], burstColor: 0x44ccff, nightMaterials: nightMats };
}

// ── Dark Ride ─────────────────────────────────────────────────────────────────

function buildDarkRide(container: THREE.Object3D, x: number, z: number): BuildResult {
  const nightMats: THREE.MeshLambertMaterial[] = [];
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Building
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x0d0d1a });
  const building = new THREE.Mesh(new THREE.BoxGeometry(7.0, 4.0, 5.5), wallMat);
  building.position.y = 2.0;
  g.add(building);

  // Roof
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x0a0a14 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.4, 5.9), roofMat);
  roof.position.y = 4.2;
  g.add(roof);

  // Neon sign
  const signMat = gm(0xff00ff, 0xff00cc, 3.0);
  nightMats.push(signMat);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 0.12), signMat);
  sign.position.set(0, 4.5, 2.81);
  g.add(sign);

  // Star decorations on facade
  const starColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff4488];
  nightMats.push(...addBulbs(g, 16,
    (i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return [-1.8 + col * 1.2, 1.0 + row * 0.9, 2.85];
    },
    starColors));

  // Ride entrance arch
  const archMat = gm(0x8800ff, 0x6600cc, 1.2);
  nightMats.push(archMat);
  const archL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.2), archMat);
  archL.position.set(-0.75, 1.2, 3.0);
  g.add(archL);
  const archR = archL.clone();
  archR.position.x = 0.75;
  g.add(archR);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 0.2), archMat);
  archTop.position.set(0, 2.5, 3.0);
  g.add(archTop);

  // Track (simple loop in front of building)
  const trackMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
  const trackPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = (i / 40) * Math.PI * 2;
    trackPts.push(new THREE.Vector3(Math.cos(u) * 3.0, 0.15, Math.sin(u) * 1.4 + 4.5));
  }
  const trackCurve = new THREE.CatmullRomCurve3(trackPts, true);
  const track = new THREE.Mesh(new THREE.TubeGeometry(trackCurve, 100, 0.06, 5, true), trackMat);
  g.add(track);

  // Ride car on track
  const carMat = new THREE.MeshLambertMaterial({ color: 0x220033 });
  const carBodyMat = gm(0x9900ff, 0x7700cc, 0.6);
  nightMats.push(carBodyMat);
  const car = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.65), carMat);
  const carTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.6), carBodyMat);
  carTop.position.y = 0.31;
  car.add(carTop);
  g.add(car);

  container.add(g);

  const animator: Animator = (t) => {
    const phase = (t * 0.18) % 1;
    const pt = trackCurve.getPoint(phase);
    car.position.copy(pt);
    const tan = trackCurve.getTangent(phase);
    car.lookAt(pt.clone().add(tan));
    sign.position.y = 4.5 + Math.sin(t * 2.0) * 0.05;
  };
  return { animator, clickTargets: [building, car], burstColor: 0x9900ff, nightMaterials: nightMats };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function buildAttraction(container: THREE.Object3D, a: PlacedAttraction): BuildResult {
  switch (a.type) {
    case "ferrisWheel":     return buildFerrisWheel(container, a.x, a.z);
    case "rollerCoaster":   return buildRollerCoaster(container, a.x, a.z);
    case "coffeeCups":      return buildCoffeeCups(container, a.x, a.z);
    case "merryGoRound":    return buildMerryGoRound(container, a.x, a.z);
    case "shootingGallery": return buildShootingGallery(container, a.x, a.z);
    case "miniTrain":       return buildMiniTrain(container, a.x, a.z);
    case "dropTower":       return buildDropTower(container, a.x, a.z);
    case "swingCarousel":   return buildSwingCarousel(container, a.x, a.z);
    case "bumperCars":      return buildBumperCars(container, a.x, a.z);
    case "hauntedHouse":    return buildHauntedHouse(container, a.x, a.z);
    case "waterSlide":      return buildWaterSlide(container, a.x, a.z);
    case "darkRide":        return buildDarkRide(container, a.x, a.z);
  }
}

import * as THREE from "three";
import type { PlacedAttraction } from "./types";

export type Animator = (t: number) => void;

export interface BuildResult {
  animator: Animator;
  clickTargets: THREE.Object3D[];
  burstColor: number;
}

function buildFerrisWheel(container: THREE.Object3D, x: number, z: number): BuildResult {
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(x, 0, z);

  const R = 4.5; // ring radius — bottom touches ground at y=0
  const CY = R;  // ring center y
  const poleMat  = new THREE.MeshLambertMaterial({ color: 0xcc4444 });
  const ringMat  = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
  const boothMat = new THREE.MeshLambertMaterial({ color: 0xdd8844 });
  const roofMat  = new THREE.MeshLambertMaterial({ color: 0xcc3333 });

  // Support legs (A-frame style)
  [[-1.4, 0], [1.4, 0], [0, -1.0], [0, 1.0]].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, CY * 2 + 0.1), poleMat);
    pole.position.set(px, CY, pz as number);
    wheelGroup.add(pole);
  });
  // Cross brace
  const brace = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.12), poleMat);
  brace.position.set(0, CY * 0.55, 0);
  wheelGroup.add(brace);

  // Ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.14, 8, 56), ringMat);
  ring.position.set(0, CY, 0);
  wheelGroup.add(ring);

  // Spokes
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, R), ringMat);
    spoke.position.set(0, CY, 0);
    spoke.rotation.z = angle + Math.PI / 2;
    spoke.translateY(R / 2);
    wheelGroup.add(spoke);
  }

  // Booth at base
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.6), boothMat);
  booth.position.set(0, 0.8, 1.6);
  wheelGroup.add(booth);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.8, 4), roofMat);
  roof.position.set(0, 1.6 + 0.4, 1.6);
  roof.rotation.y = Math.PI / 4;
  wheelGroup.add(roof);
  // Booth window
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.5, 0.05),
    new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.7 })
  );
  win.position.set(0, 0.9, 2.4);
  wheelGroup.add(win);

  // Gondolas (added to container so they rotate independently)
  const gondolaColors = [0xff6699, 0x66ccff, 0xffaa33, 0x99ff66, 0xcc66ff, 0xff4444, 0x44ffee, 0xffee44];
  const gondolas: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const gondola = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.55, 0.4),
      new THREE.MeshLambertMaterial({ color: gondolaColors[i] })
    );
    gondola.position.set(x + Math.cos(angle) * R, CY + Math.sin(angle) * R, z);
    gondolas.push(gondola);
    container.add(gondola);
  }
  container.add(wheelGroup);

  const animator: Animator = (t) => {
    ring.rotation.z += 0.005;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t * 0.005 * Math.PI * 2;
      gondolas[i].position.set(
        x + Math.cos(angle) * R,
        CY + Math.sin(angle) * R,
        z
      );
      gondolas[i].rotation.z = -angle;
    }
  };

  return { animator, clickTargets: [ring, ...gondolas], burstColor: 0xffdd00 };
}

function buildRollerCoaster(container: THREE.Object3D, x: number, z: number): BuildResult {
  const coasterGroup = new THREE.Group();
  coasterGroup.position.set(x, 0, z);

  const trackMat   = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const supportMat = new THREE.MeshLambertMaterial({ color: 0xf5a623 });
  const stationMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const roofMat    = new THREE.MeshLambertMaterial({ color: 0xcc2222 });

  // ── Track curve (bigger, more dramatic) ──────────────────────────────
  const pts: THREE.Vector3[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * Math.PI * 2;
    // Oval footprint with hills, a tall lift, and a tight loop section
    const rx = 6, rz = 4;
    const px = Math.cos(u) * rx;
    const pz = Math.sin(u) * rz;
    // Height: big lift hill at u≈0, sharp drop, small bunny hills
    const lift   = Math.max(0, Math.cos(u) * 3.5);            // tall hill at front
    const bunny  = Math.sin(u * 3) * 0.8;                     // 3 bunny hills
    const loop   = u > Math.PI * 0.8 && u < Math.PI * 1.2     // loop section
                   ? Math.sin((u - Math.PI * 0.8) / 0.4 * Math.PI) * 3.5
                   : 0;
    pts.push(new THREE.Vector3(px, 1.2 + lift + bunny + loop, pz));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  coasterGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.09, 6, true),
    trackMat
  ));

  // ── Support pillars ───────────────────────────────────────────────────
  const pillarCount = 28;
  for (let i = 0; i < pillarCount; i++) {
    const pt = curve.getPoint(i / pillarCount);
    if (pt.y < 1.5) continue; // skip low sections (already near ground)
    const h = pt.y - 0.05;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.1, h, 5),
      supportMat
    );
    pillar.position.set(pt.x, h / 2, pt.z);
    coasterGroup.add(pillar);
  }

  // ── Station platform ──────────────────────────────────────────────────
  const platform = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.4), stationMat);
  platform.position.set(-5.5, 0.1, 0);
  coasterGroup.add(platform);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.6), roofMat);
  roof.position.set(-5.5, 1.5, 0);
  coasterGroup.add(roof);
  // Roof supports
  for (const [sx, sz] of [[-6.9, -0.6], [-6.9, 0.6], [-4.1, -0.6], [-4.1, 0.6]] as [number, number][]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 5), supportMat);
    post.position.set(sx, 0.7, sz);
    coasterGroup.add(post);
  }

  // ── Train: 3 carts ────────────────────────────────────────────────────
  const cartOffsets = [0, 0.035, 0.07]; // spacing along curve
  const cartColors  = [0xff2200, 0xff5500, 0xff8800];
  const carts = cartOffsets.map((offset, i) => {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.38, 0.45),
      new THREE.MeshLambertMaterial({ color: cartColors[i] })
    );
    // Windshield
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.22, 0.44),
      new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 })
    );
    glass.position.set(0.22, 0.1, 0);
    body.add(glass);
    coasterGroup.add(body);
    return { body, offset };
  });

  container.add(coasterGroup);

  const speed = 0.032;
  const animator: Animator = (t) => {
    carts.forEach(({ body, offset }) => {
      const u = ((t * speed) + offset) % 1;
      const pos     = curve.getPoint(u);
      const tangent = curve.getTangent(u);
      body.position.copy(pos);
      body.lookAt(pos.clone().add(tangent));
    });
  };

  return { animator, clickTargets: carts.map(c => c.body), burstColor: 0xff4400 };
}

function buildCoffeeCups(container: THREE.Object3D, x: number, z: number): BuildResult {
  const cupGroup = new THREE.Group();
  cupGroup.position.set(x, 0, z);
  cupGroup.add(new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 0.15, 32),
    new THREE.MeshLambertMaterial({ color: 0xee88ff })
  ));
  const cupColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88];
  const cups: { outer: THREE.Group; inner: THREE.Group }[] = [];
  const cupMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const outer = new THREE.Group();
    outer.position.set(Math.cos(angle) * 1.4, 0.15, Math.sin(angle) * 1.4);
    const inner = new THREE.Group();
    const cupMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.25, 0.5, 16),
      new THREE.MeshLambertMaterial({ color: cupColors[i] })
    );
    cupMesh.position.y = 0.25;
    inner.add(cupMesh);
    inner.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    ));
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

  return { animator, clickTargets: cupMeshes, burstColor: 0xee88ff };
}

function buildMerryGoRound(container: THREE.Object3D, x: number, z: number): BuildResult {
  const merryGroup = new THREE.Group();
  merryGroup.position.set(x, 0, z);
  merryGroup.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 4),
    new THREE.MeshLambertMaterial({ color: 0xffaacc })
  ));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0xff66aa }));
  roof.position.y = 3.6;
  merryGroup.add(roof);
  merryGroup.add(new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 0.15, 32),
    new THREE.MeshLambertMaterial({ color: 0xffddee })
  ));
  const horseColors = [0xffffff, 0xffcc88, 0xaaddff, 0xffaacc];
  const horses: { group: THREE.Group; baseY: number; phase: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const hg = new THREE.Group();
    hg.position.set(Math.cos(angle) * 1.4, 0.5, Math.sin(angle) * 1.4);
    hg.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2),
      new THREE.MeshLambertMaterial({ color: 0xdddddd })
    ));
    const hbody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.2), new THREE.MeshLambertMaterial({ color: horseColors[i] }));
    hbody.position.y = 0.8;
    hg.add(hbody);
    const hhead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), new THREE.MeshLambertMaterial({ color: horseColors[i] }));
    hhead.position.set(0.3, 1.05, 0);
    hg.add(hhead);
    merryGroup.add(hg);
    horses.push({ group: hg, baseY: 0.5, phase: (i / 4) * Math.PI * 2 });
  }
  container.add(merryGroup);

  const animator: Animator = (t) => {
    merryGroup.rotation.y += 0.012;
    horses.forEach((h) => {
      h.group.position.y = h.baseY + Math.sin(t * 2 + h.phase) * 0.3;
    });
  };

  const horseMeshes = horses.map(h => h.group.children[1] as THREE.Mesh);
  return { animator, clickTargets: [roof, ...horseMeshes], burstColor: 0xff66aa };
}

function buildShootingGallery(container: THREE.Object3D, x: number, z: number): BuildResult {
  const shootGroup = new THREE.Group();
  shootGroup.position.set(x, 0, z);
  const boothMat = new THREE.MeshLambertMaterial({ color: 0xcc8844 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.2), boothMat);
  backWall.position.set(0, 1.25, 0);
  shootGroup.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 1.5), boothMat);
  leftWall.position.set(-1.5, 1.25, -0.7);
  shootGroup.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 1.5), boothMat);
  rightWall.position.set(1.5, 1.25, -0.7);
  shootGroup.add(rightWall);
  const targetColors = [0xff2222, 0x2222ff, 0x22ff22, 0xffff22, 0xff22ff];
  const targets: { mesh: THREE.Mesh; fallen: boolean; resetT: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const target = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16),
      new THREE.MeshLambertMaterial({ color: targetColors[i] })
    );
    target.position.set(-1 + i * 0.5, 1.8, -0.1);
    shootGroup.add(target);
    targets.push({ mesh: target, fallen: false, resetT: 0 });
  }
  container.add(shootGroup);

  const animator: Animator = () => {
    targets.forEach((tgt) => {
      if (tgt.fallen) {
        tgt.mesh.rotation.x = Math.PI / 2;
        tgt.resetT -= 0.016;
        if (tgt.resetT <= 0) { tgt.fallen = false; tgt.mesh.rotation.x = 0; }
      }
    });
  };

  const targetMeshes = targets.map(t => t.mesh);
  return { animator, clickTargets: targetMeshes, burstColor: 0xffff00 };
}

function buildMiniTrain(container: THREE.Object3D, x: number, z: number): BuildResult {
  const trainGroup = new THREE.Group();
  trainGroup.position.set(x, 0, z);

  const rx = 6, rz = 4;
  const trackPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const a = (i / 80) * Math.PI * 2;
    trackPoints.push(new THREE.Vector3(Math.cos(a) * rx, 0.05, Math.sin(a) * rz));
  }
  const trainCurve = new THREE.CatmullRomCurve3(trackPoints, true);

  // Rails (two parallel tubes)
  const railMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  for (const offset of [-0.18, 0.18]) {
    const railPts = trackPoints.map(p => new THREE.Vector3(p.x + offset, p.y, p.z));
    const railCurve = new THREE.CatmullRomCurve3(railPts, true);
    trainGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 128, 0.04, 4, true),
      railMat
    ));
  }
  // Sleepers
  const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  for (let i = 0; i < 40; i++) {
    const pt = trainCurve.getPoint(i / 40);
    const tang = trainCurve.getTangent(i / 40);
    const slp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.12), sleeperMat);
    slp.position.copy(pt);
    slp.lookAt(pt.clone().add(tang));
    trainGroup.add(slp);
  }

  // Station platform
  const statMat = new THREE.MeshLambertMaterial({ color: 0xfff0cc });
  const roofMat2 = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 1.4), statMat);
  platform.position.set(-rx, 0.09, 0);
  trainGroup.add(platform);
  const statRoof = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 1.6), roofMat2);
  statRoof.position.set(-rx, 1.5, 0);
  trainGroup.add(statRoof);
  for (const [px, pz] of [[-rx - 1.7, -0.65], [-rx - 1.7, 0.65], [-rx + 1.7, -0.65], [-rx + 1.7, 0.65]] as [number,number][]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 5),
      new THREE.MeshLambertMaterial({ color: 0xcc9955 }));
    post.position.set(px, 0.7, pz);
    trainGroup.add(post);
  }

  // Train cars (locomotive + 3 carriages)
  const carColors = [0xcc2200, 0x3355cc, 0x228822, 0xcc7700];
  const trainCars: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const isLoco = i === 0;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(isLoco ? 0.9 : 0.75, isLoco ? 0.55 : 0.45, 0.55),
      new THREE.MeshLambertMaterial({ color: carColors[i] })
    );
    if (isLoco) {
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8),
        new THREE.MeshLambertMaterial({ color: 0x222222 }));
      chimney.position.set(0.3, 0.38, 0);
      body.add(chimney);
    }
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.18, 0.56),
      new THREE.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.7 })
    );
    win.position.set(-0.15, 0.1, 0);
    body.add(win);
    container.add(body);
    trainCars.push(body);
  }
  container.add(trainGroup);

  // Smoke puffs
  const smokeMat = new THREE.MeshLambertMaterial({ color: 0xdddddd, transparent: true, opacity: 0.5 });
  const smokePuffs = Array.from({ length: 5 }, () => {
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
      trainCars[i].position.y = 0.3;
      trainCars[i].lookAt(tp.clone().add(tt));
    }
    // Smoke rises from locomotive chimney
    smokePuffs.forEach((s, i) => {
      const age = ((t * 0.6 + i * 0.2) % 1);
      const locoPos = trainCars[0].position.clone();
      const locoFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(trainCars[0].quaternion);
      s.position.copy(locoPos).addScaledVector(locoFwd, 0.35);
      s.position.y = 0.7 + age * 2.5;
      s.position.x += Math.sin(t + i) * 0.06;
      (s.material as THREE.MeshLambertMaterial).opacity = 0.45 * (1 - age);
      const sc = 0.5 + age * 1.5;
      s.scale.set(sc, sc, sc);
    });
  };

  return { animator, clickTargets: trainCars, burstColor: 0xff4400 };
}

function buildDropTower(container: THREE.Object3D, x: number, z: number): BuildResult {
  const dropGroup = new THREE.Group();
  dropGroup.position.set(x, 0, z);
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 9, 12),
    new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
  );
  pillar.position.y = 4.5; // bottom at y=0
  dropGroup.add(pillar);
  const dropTopCap = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 12), new THREE.MeshLambertMaterial({ color: 0xff2244 }));
  dropTopCap.position.y = 9.6;
  dropGroup.add(dropTopCap);
  const dropRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.14, 8, 24),
    new THREE.MeshLambertMaterial({ color: 0xff8800 })
  );
  dropRing.position.y = 1;
  dropGroup.add(dropRing);
  const dropSeatColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88, 0xcc44ff, 0xff8844];
  const dropSeatMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.32, 0.22),
      new THREE.MeshLambertMaterial({ color: dropSeatColors[i] })
    );
    seat.position.set(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85);
    dropRing.add(seat);
    dropSeatMeshes.push(seat);
  }
  container.add(dropGroup);

  const animator: Animator = (t) => {
    const dropPhase = (t * 0.35) % 1;
    if (dropPhase < 0.6) {
      dropRing.position.y = 1 + (dropPhase / 0.6) * 7;
    } else {
      const fall = (dropPhase - 0.6) / 0.4;
      dropRing.position.y = 8 - fall * fall * 7;
    }
    dropRing.rotation.y += 0.015;
  };

  return { animator, clickTargets: [dropRing, ...dropSeatMeshes], burstColor: 0xff8800 };
}

function buildSwingCarousel(container: THREE.Object3D, x: number, z: number): BuildResult {
  const swingGroup = new THREE.Group();
  swingGroup.position.set(x, 0, z);
  const centerPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 5, 12),
    new THREE.MeshLambertMaterial({ color: 0x44aaff })
  );
  centerPole.position.y = 2.5; // bottom at y=0
  swingGroup.add(centerPole);
  const baseDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16),
    new THREE.MeshLambertMaterial({ color: 0x44aaff })
  );
  baseDisk.position.y = 0.1;
  swingGroup.add(baseDisk);
  const swingCanopy = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.0, 16), new THREE.MeshLambertMaterial({ color: 0xff6644 }));
  swingCanopy.position.y = 5.5;
  swingGroup.add(swingCanopy);
  const swingTop = new THREE.Group();
  swingTop.position.y = 5;
  const swingArms: THREE.Group[] = [];
  const swingChairColors = [0xff4444, 0x44aaff, 0xffcc00, 0x44ff88, 0xff44aa, 0xaa44ff, 0xff8800, 0x44ffee];
  const chairMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 8) * Math.PI * 2;
    const arm = new THREE.Group();
    arm.position.set(1.5, 0, 0);
    arm.rotation.z = 0.25;
    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
      new THREE.MeshLambertMaterial({ color: 0xbbbbbb })
    );
    chain.position.y = -0.6;
    arm.add(chain);
    const chairMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.22, 0.22),
      new THREE.MeshLambertMaterial({ color: swingChairColors[i] })
    );
    chairMesh.position.y = -1.3;
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
    const swingLean = 0.22 + Math.sin(t * 0.4) * 0.08;
    swingArms.forEach((arm) => { arm.rotation.z = swingLean; });
  };

  return { animator, clickTargets: chairMeshes, burstColor: 0xff6644 };
}

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
  }
}

import { useEffect, useRef } from "react";
import type React from "react";
import * as THREE from "three";
import type { PlacedAttraction, AttractionType, PlacedShop, ShopType } from "./types";
import { buildAttraction, type Animator } from "./builders";
import { buildShop } from "./shopBuilders";

function getTimeOfDay(): "day" | "night" {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

const DAY = { sky: 0x87ceeb, ground: 0x90ee90, light: 0xffffff, ambient: 0xffd580 };
const NIGHT = { sky: 0x0a0a2e, ground: 0x2d4a1e, light: 0x8888ff, ambient: 0x222244 };

function makePerson(color: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4), mat);
  body.position.y = 0.2;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13), mat);
  head.position.y = 0.55;
  g.add(head);
  [-0.07, 0.07].forEach((x, i) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3), mat);
    leg.position.set(x, -0.05, 0);
    leg.name = `leg${i}`;
    g.add(leg);
  });
  return g;
}

function makeChild(color: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28), mat);
  body.position.y = 0.14;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.10), mat);
  head.position.y = 0.38;
  g.add(head);
  [-0.05, 0.05].forEach((x, i) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22), mat);
    leg.position.set(x, -0.04, 0);
    leg.name = `leg${i}`;
    g.add(leg);
  });
  return g;
}

function makeFamilyGroup(adultColor: number, childColor: number): THREE.Group {
  const g = new THREE.Group();
  const adult1 = makePerson(adultColor);
  adult1.position.set(-0.22, 0, 0);
  g.add(adult1);
  const adult2 = makePerson(adultColor === 0xff9966 ? 0x66aaff : 0xff9966);
  adult2.position.set(0.22, 0, 0);
  g.add(adult2);
  const child = makeChild(childColor);
  child.position.set(0, 0, 0.28);
  g.add(child);
  // Store refs for leg animation
  g.userData.adult1 = adult1;
  g.userData.adult2 = adult2;
  g.userData.child  = child;
  return g;
}

function makeCar(bodyColor: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.9), mat);
  lower.position.y = 0.32;
  g.add(lower);
  const upper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 0.82), mat);
  upper.position.set(-0.1, 0.77, 0);
  g.add(upper);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  [[-0.65, 0.18], [0.65, 0.18]].forEach(([x, y]) => {
    [-0.48, 0.48].forEach((z) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 10), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      g.add(w);
    });
  });
  return g;
}

function makeBus(bodyColor: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.1), mat);
  body.position.y = 0.8;
  g.add(body);
  const winMat = new THREE.MeshLambertMaterial({ color: 0xaaddff });
  const win = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.44, 1.12), winMat);
  win.position.set(0, 1.04, 0);
  g.add(win);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  [[-1.2, 0.25], [1.2, 0.25]].forEach(([x, y]) => {
    [-0.6, 0.6].forEach((z) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 10), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      g.add(w);
    });
  });
  return g;
}

interface ClickableEntry {
  id: string;
  objects: THREE.Object3D[];
  onHit: (pos: THREE.Vector3) => void;
}

interface AnimatorEntry {
  id: string;
  fn: Animator;
}

interface AttractionGroupInfo {
  group: THREE.Group;
  x: number;
  z: number;
}

export type WeatherType = "sunny" | "cloudy" | "rainy";

interface Props {
  attractions: PlacedAttraction[];
  placingType: AttractionType | null;
  onPlace: (x: number, z: number) => void;
  onBalloonPop: () => void;
  demolishing: boolean;
  onDemolish: (id: string) => void;
  shops: PlacedShop[];
  placingShopType: ShopType | null;
  onPlaceShop: (x: number, z: number) => void;
  onDemolishShop: (id: string) => void;
  onWeatherChange: (w: WeatherType) => void;
  celebrateTriggerRef: React.MutableRefObject<((level?: number) => void) | null>;
  currentVisitors: number;
}

export default function ParkScene({ attractions, placingType, onPlace, onBalloonPop, demolishing, onDemolish, shops, placingShopType, onPlaceShop, onDemolishShop, onWeatherChange, celebrateTriggerRef, currentVisitors }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const renderedRef = useRef<Set<string>>(new Set());
  const animatorsRef = useRef<AnimatorEntry[]>([]);
  const clickablesRef = useRef<ClickableEntry[]>([]);
  const placingTypeRef = useRef<AttractionType | null>(null);
  const onPlaceRef = useRef<(x: number, z: number) => void>(onPlace);
  const attractionsRef = useRef<PlacedAttraction[]>(attractions);
  const ghostRef = useRef<THREE.Mesh | null>(null);
  const ghostMatRef = useRef<THREE.MeshLambertMaterial | null>(null);
  const addPathFnRef = useRef<((attrX: number, attrZ: number, attrId: string) => void) | null>(null);
  const burstEmitterRef = useRef<((pos: THREE.Vector3, color: number) => void) | null>(null);
  const onBalloonPopRef = useRef<(() => void)>(onBalloonPop);
  const demolishingRef = useRef(false);
  const onDemolishRef = useRef<(id: string) => void>(onDemolish);
  const attractionGroupsRef = useRef<Map<string, AttractionGroupInfo>>(new Map());
  const shopsRef = useRef<PlacedShop[]>(shops);
  const placingShopTypeRef = useRef<ShopType | null>(null);
  const onPlaceShopRef = useRef<(x: number, z: number) => void>(onPlaceShop);
  const onDemolishShopRef = useRef<(id: string) => void>(onDemolishShop);
  const shopGroupsRef = useRef<Map<string, AttractionGroupInfo>>(new Map());
  const onWeatherChangeRef = useRef<(w: WeatherType) => void>(onWeatherChange);
  const celebrateRef = useRef<(() => void) | null>(null);
  const currentVisitorsRef = useRef(currentVisitors);

  // Sync refs with props each render
  useEffect(() => { placingTypeRef.current = placingType; }, [placingType]);
  useEffect(() => { onPlaceRef.current = onPlace; }, [onPlace]);
  useEffect(() => { onBalloonPopRef.current = onBalloonPop; }, [onBalloonPop]);
  useEffect(() => { attractionsRef.current = attractions; }, [attractions]);
  useEffect(() => { demolishingRef.current = demolishing; }, [demolishing]);
  useEffect(() => { onDemolishRef.current = onDemolish; }, [onDemolish]);
  useEffect(() => { shopsRef.current = shops; }, [shops]);
  useEffect(() => { placingShopTypeRef.current = placingShopType; }, [placingShopType]);
  useEffect(() => { onWeatherChangeRef.current = onWeatherChange; }, [onWeatherChange]);
  useEffect(() => { currentVisitorsRef.current = currentVisitors; }, [currentVisitors]);
  useEffect(() => { onPlaceShopRef.current = onPlaceShop; }, [onPlaceShop]);
  useEffect(() => { onDemolishShopRef.current = onDemolishShop; }, [onDemolishShop]);

  // Add new attractions / remove demolished ones whenever the list changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove attractions no longer in the list
    const currentIds = new Set(attractions.map((a) => a.id));
    for (const [id, info] of attractionGroupsRef.current) {
      if (!currentIds.has(id)) {
        scene.remove(info.group);
        animatorsRef.current = animatorsRef.current.filter((a) => a.id !== id);
        clickablesRef.current = clickablesRef.current.filter((c) => c.id !== id);
        attractionGroupsRef.current.delete(id);
        renderedRef.current.delete(id);
        // Burst effect on demolish
        burstEmitterRef.current?.(new THREE.Vector3(info.x, 3, info.z), 0xff6600);
      }
    }

    // Add new attractions
    for (const a of attractions) {
      if (renderedRef.current.has(a.id)) continue;
      renderedRef.current.add(a.id);
      addPathFnRef.current?.(a.x, a.z, a.id);
      const group = new THREE.Group();
      scene.add(group);
      const result = buildAttraction(group, a);
      attractionGroupsRef.current.set(a.id, { group, x: a.x, z: a.z });
      animatorsRef.current.push({ id: a.id, fn: result.animator });
      const { clickTargets, burstColor } = result;
      clickablesRef.current.push({
        id: a.id,
        objects: clickTargets,
        onHit: (pos) => { burstEmitterRef.current?.(pos, burstColor); },
      });
    }
  }, [attractions]);

  // Add new shops / remove demolished ones
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentIds = new Set(shops.map((s) => s.id));
    for (const [id, info] of shopGroupsRef.current) {
      if (!currentIds.has(id)) {
        scene.remove(info.group);
        animatorsRef.current = animatorsRef.current.filter((a) => a.id !== id);
        clickablesRef.current = clickablesRef.current.filter((c) => c.id !== id);
        shopGroupsRef.current.delete(id);
        renderedRef.current.delete(id);
        burstEmitterRef.current?.(new THREE.Vector3(info.x, 2, info.z), 0xffb830);
      }
    }
    for (const s of shops) {
      if (renderedRef.current.has(s.id)) continue;
      renderedRef.current.add(s.id);
      addPathFnRef.current?.(s.x, s.z, s.id);
      const group = new THREE.Group();
      scene.add(group);
      const result = buildShop(group, s);
      shopGroupsRef.current.set(s.id, { group, x: s.x, z: s.z });
      animatorsRef.current.push({ id: s.id, fn: result.animator });
      clickablesRef.current.push({
        id: s.id,
        objects: result.clickTargets,
        onHit: (pos) => { burstEmitterRef.current?.(pos, result.burstColor); },
      });
    }
  }, [shops]);

  // Static scene setup — runs once on mount
  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth;
    const H = mount.clientHeight;
    const theme = getTimeOfDay() === "day" ? DAY : NIGHT;
    const isNight = getTimeOfDay() === "night";

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.Fog(theme.sky, 40, 100);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    const cameraTarget = new THREE.Vector3(0, 4, 0);
    let cameraRadius = 30;
    let cameraTheta = 0;
    let cameraPhi = 1.4;
    camera.position.set(0, 10, 28);
    camera.lookAt(cameraTarget);

    scene.add(new THREE.AmbientLight(theme.ambient, 0.8));
    const sun = new THREE.DirectionalLight(theme.light, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshLambertMaterial({ color: theme.ground })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 4),
      new THREE.MeshLambertMaterial({ color: 0x555555 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 14);
    scene.add(road);
    for (let i = -25; i <= 25; i++) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.12),
        new THREE.MeshLambertMaterial({ color: 0xffff00 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i * 5, 0.02, 14);
      scene.add(dash);
    }

    // Sidewalks
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xccccbb });
    const swNear = new THREE.Mesh(new THREE.PlaneGeometry(200, 1.2), sidewalkMat);
    swNear.rotation.x = -Math.PI / 2;
    swNear.position.set(0, 0.015, 11.4);
    scene.add(swNear);
    const swFar = new THREE.Mesh(new THREE.PlaneGeometry(200, 1.2), sidewalkMat);
    swFar.rotation.x = -Math.PI / 2;
    swFar.position.set(0, 0.015, 16.6);
    scene.add(swFar);

    // Park wall with gate opening
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xbb8855 });
    [-1, 1].forEach((side) => {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(95.5, 0.65, 0.28), wallMat);
      seg.position.set(side * 52.25, 0.325, 10.8);
      scene.add(seg);
    });
    const postMat = new THREE.MeshLambertMaterial({ color: 0x996633 });
    for (let i = -24; i <= 24; i++) {
      if (i === 0) continue;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), postMat);
      post.position.set(i * 5, 0.45, 10.8);
      scene.add(post);
    }

    // Gate
    const gateMat = new THREE.MeshLambertMaterial({ color: 0xfff0cc });
    const gateAccent = new THREE.MeshLambertMaterial({ color: 0xff7744 });
    [-4.2, 4.2].forEach((gx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.75, 1.1), gateMat);
      pillar.position.set(gx, 1.375, 10.8);
      scene.add(pillar);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 1.5), gateAccent);
      cap.position.set(gx, 2.89, 10.8);
      scene.add(cap);
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.16), new THREE.MeshLambertMaterial({ color: 0xffff88 }));
      light.position.set(gx, 3.19, 10.8);
      scene.add(light);
    });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.4, 0.9), gateMat);
    beam.position.set(0, 2.6, 10.8);
    scene.add(beam);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.55, 0.2), gateAccent);
    sign.position.set(0, 2.9, 10.5);
    scene.add(sign);

    // Park paths — central avenue (always present)
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xddc888 });
    function addPath(x1: number, z1: number, x2: number, z2: number, w = 1.0) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.1) return;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, len), pathMat);
      seg.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
      seg.rotation.y = Math.atan2(dx, dz);
      scene.add(seg);
    }
    // Central avenue — extends deep into the park
    addPath(0, 10.4, 0, -22, 2.2);

    // Branch path with obstacle avoidance
    function addBranchPath(destX: number, destZ: number, skipId: string) {
      const others = attractionsRef.current.filter(a => a.id !== skipId);
      const xMin = Math.min(0, destX), xMax = Math.max(0, destX);
      const blocker = others.find(a =>
        a.x > xMin + 0.5 && a.x < xMax - 0.5 &&
        Math.abs(a.z - destZ) < 3.5
      );
      if (blocker) {
        const side = blocker.z <= destZ ? 1 : -1;
        const dz = destZ + side * 5;
        addPath(0, destZ, 0, dz, 1.1);
        addPath(0, dz, destX, dz, 1.1);
        addPath(destX, dz, destX, destZ, 1.1);
      } else {
        addPath(0, destZ, destX, destZ, 1.1);
      }
    }
    addPathFnRef.current = addBranchPath;

    // Trees
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7a4f2e });
    const foliageMat1 = new THREE.MeshLambertMaterial({ color: 0x2d6b2d });
    const foliageMat2 = new THREE.MeshLambertMaterial({ color: 0x3a8f3a });
    for (let i = -22; i <= 22; i++) {
      if (Math.abs(i) <= 1) continue;
      const tx = i * 4.5 + (Math.random() - 0.5) * 1.5;
      const tz = 8.5 + Math.random() * 1.3;
      const sc = 0.7 + Math.random() * 0.5;
      const trunkH = 1.4 * sc;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * sc, 0.18 * sc, trunkH, 7), trunkMat);
      trunk.position.set(tx, trunkH / 2, tz);
      scene.add(trunk);
      [{ r: 1.3, dy: 0.6 }, { r: 0.85, dy: 1.4 }].forEach(({ r, dy }) => {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(r * sc, 1.6 * sc, 8),
          dy < 1 ? foliageMat1 : foliageMat2
        );
        cone.position.set(tx, trunkH + dy * sc, tz);
        scene.add(cone);
      });
    }

    // Flags
    const flagColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3),
        new THREE.MeshLambertMaterial({ color: 0x888888 })
      );
      pole.position.set(-8 + i * 4, 1.5, 16.8);
      scene.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.5),
        new THREE.MeshLambertMaterial({ color: flagColors[i], side: THREE.DoubleSide })
      );
      flag.position.set(-8 + i * 4 + 0.4, 2.8, 16.8);
      scene.add(flag);
    }

    // Balloons — keep only 2 floating at once
    const balloons: { mesh: THREE.Mesh; speed: number; startY: number; x: number; z: number; color: number }[] = [];
    const balloonColors = [0xff2222, 0xff8800, 0xffff00, 0x00cc44, 0x2288ff, 0xcc44ff, 0xff44aa];
    for (let i = 0; i < 2; i++) {
      const color = balloonColors[i % balloonColors.length];
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 12),
        new THREE.MeshLambertMaterial({ color })
      );
      const bx = (Math.random() - 0.5) * 30;
      const bz = (Math.random() - 0.5) * 16;
      const startY = Math.random() * 8 + 1;
      balloon.position.set(bx, startY, bz);
      const strGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.5, 0),
      ]);
      balloon.add(new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
      scene.add(balloon);
      balloons.push({ mesh: balloon, speed: 0.008 + Math.random() * 0.012, startY, x: bx, z: bz, color });
    }
    // Make each balloon clickable — pop it for +$1
    for (const b of balloons) {
      clickablesRef.current.push({
        id: "balloon",
        objects: [b.mesh],
        onHit: (pos) => {
          b.mesh.visible = false;
          burstEmitterRef.current?.(pos, b.color);
          onBalloonPopRef.current();
          setTimeout(() => {
            b.mesh.position.set(b.x, b.startY, b.z);
            b.mesh.visible = true;
          }, 2500);
        },
      });
    }

    // Clouds — drift left to right, semi-transparent so park shows through
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.80,
      depthWrite: false,
    });
    type CloudEntry = { group: THREE.Group; speed: number };
    const clouds: CloudEntry[] = [];
    for (let ci = 0; ci < 12; ci++) {
      const group = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 5);
      for (let p = 0; p < puffCount; p++) {
        const r = 2.2 + Math.random() * 2.8;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 0.8, // tight y range → flat
          (Math.random() - 0.5) * 4
        );
        group.add(puff);
      }
      // Flatten clouds strongly on y axis
      group.scale.set(1, 0.28, 0.7);
      group.position.set(
        -70 + Math.random() * 140,
        13 + Math.random() * 5,
        -20 + Math.random() * 40   // extends into foreground (z up to +20)
      );
      scene.add(group);
      clouds.push({ group, speed: 0.022 + Math.random() * 0.028 });
    }

    // People — waypoint-based path following
    const personColors = [0xff9966, 0x66aaff, 0xffcc44, 0xcc66ff, 0x44ddaa, 0xff6644, 0xaaddff, 0xffaacc, 0xff4488, 0x88ff44, 0x44ffee, 0xffaa66];
    const w = (x: number, z: number) => new THREE.Vector3(x, 0, z);
    const routes: THREE.Vector3[][] = [
      [w(-15, 11.5), w(15, 11.5)],
      [w(15, 11.7), w(-15, 11.7)],
      [w(-6, 11.4), w(6, 11.4)],
      [w(0, 10.4), w(0, -20)],
      [w(0, 10.4), w(0, -14)],
      [w(0, 10.4), w(0, 3),   w(-12, 3)],
      [w(0, 10.4), w(0, 3),   w(12, 3)],
      [w(0, 10.4), w(0, -3),  w(-9, -3)],
      [w(0, 10.4), w(0, -3),  w(9, -3)],
      [w(0, 10.4), w(0, -8),  w(-7, -8)],
      [w(0, 10.4), w(0, -8),  w(7, -8)],
      [w(0, 10.4), w(0, -13), w(-5, -13)],
      [w(0, 10.4), w(0, -13), w(5, -13)],
      [w(0, 10.4), w(0, -18), w(-4, -18)],
      [w(0, 10.4), w(0, -18), w(4, -18)],
      [w(0, 10.4), w(0, -6),  w(0, -20)],
    ];
    const childColors = [0xffdd88, 0xff88cc, 0x88ffcc, 0xffaa44, 0xaaccff];
    interface PersonData {
      group: THREE.Group;
      waypoints: THREE.Vector3[];
      segIdx: number;
      t: number;
      dir: 1 | -1;
      speed: number;
      isFamily: boolean;
    }
    const people: PersonData[] = [];
    // 12 solo visitors + 4 family groups
    for (let i = 0; i < 12; i++) {
      const person = makePerson(personColors[i % personColors.length]);
      const waypoints = routes[i % routes.length];
      const segIdx = Math.floor(Math.random() * (waypoints.length - 1));
      const t = Math.random();
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const from = dir === 1 ? waypoints[segIdx] : waypoints[segIdx + 1];
      const to   = dir === 1 ? waypoints[segIdx + 1] : waypoints[segIdx];
      person.position.lerpVectors(from, to, t);
      person.visible = false;
      scene.add(person);
      people.push({ group: person, waypoints, segIdx, t, dir, speed: 0.035 + Math.random() * 0.02, isFamily: false });
    }
    for (let i = 0; i < 4; i++) {
      const family = makeFamilyGroup(
        personColors[i % personColors.length],
        childColors[i % childColors.length]
      );
      const waypoints = routes[(i + 4) % routes.length];
      const segIdx = Math.floor(Math.random() * (waypoints.length - 1));
      const t = Math.random();
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const from = dir === 1 ? waypoints[segIdx] : waypoints[segIdx + 1];
      const to   = dir === 1 ? waypoints[segIdx + 1] : waypoints[segIdx];
      family.position.lerpVectors(from, to, t);
      family.visible = false;
      scene.add(family);
      people.push({ group: family, waypoints, segIdx, t, dir, speed: 0.028 + Math.random() * 0.015, isFamily: true });
    }

    // Vehicles
    type VehicleData = { group: THREE.Group; speed: number; resetFrom: number; resetTo: number };
    const vehicles: VehicleData[] = [];
    const carColors = [0xff2222, 0x2255ff, 0x22cc44, 0xffaa00, 0xcc44cc];
    const rightSpeed = 0.10;
    [0, 1, 2].forEach((i) => {
      const car = makeCar(carColors[i % carColors.length]);
      car.position.set(-60 + i * 40, 0, 13);
      car.rotation.y = 0;
      scene.add(car);
      vehicles.push({ group: car, speed: rightSpeed, resetFrom: -65, resetTo: 65 });
    });
    const leftSpeed = -0.08;
    const bus1 = makeBus(0xff6600);
    bus1.position.set(50, 0, 15);
    bus1.rotation.y = Math.PI;
    scene.add(bus1);
    vehicles.push({ group: bus1, speed: leftSpeed, resetFrom: 70, resetTo: -70 });
    const bus2 = makeBus(0x2255cc);
    bus2.position.set(-10, 0, 15);
    bus2.rotation.y = Math.PI;
    scene.add(bus2);
    vehicles.push({ group: bus2, speed: leftSpeed, resetFrom: 70, resetTo: -70 });
    const car3 = makeCar(carColors[3]);
    car3.position.set(-70, 0, 15);
    car3.rotation.y = Math.PI;
    scene.add(car3);
    vehicles.push({ group: car3, speed: leftSpeed, resetFrom: 70, resetTo: -70 });

    // Night stars
    if (isNight) {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600);
      for (let i = 0; i < 600; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 100;
        starPos[i + 1] = Math.random() * 40 + 10;
        starPos[i + 2] = (Math.random() - 0.5) * 100;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })));
    }

    // Weather system
    type WeatherState = "sunny" | "cloudy" | "rainy";
    let currentWeather: WeatherState = "sunny";
    let weatherTimer = 0;
    let weatherDuration = 15 + Math.random() * 15; // 15-30s in "ticks" (t increments)

    const WEATHER_CLOUD_COUNTS: Record<WeatherState, number> = { sunny: 1, cloudy: 10, rainy: 12 };
    const pickNextWeather = (): WeatherState => {
      const r = Math.random();
      return r < 0.7 ? "sunny" : r < 0.9 ? "cloudy" : "rainy";
    };

    const applyWeatherClouds = (w: WeatherState) => {
      clouds.forEach((c, i) => {
        c.group.visible = i < WEATHER_CLOUD_COUNTS[w];
      });
      scene.background = new THREE.Color(
        w === "rainy" ? 0x8899aa : w === "cloudy" ? 0xa0b8cc : theme.sky
      );
      scene.fog = new THREE.Fog(
        w === "rainy" ? 0x8899aa : w === "cloudy" ? 0xa0b8cc : theme.sky,
        40, 100
      );
    };
    applyWeatherClouds(currentWeather);

    // Rain particles
    const RAIN_COUNT = 400;
    const rainPositions = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      rainPositions[i * 3]     = (Math.random() - 0.5) * 80;
      rainPositions[i * 3 + 1] = Math.random() * 22 + 2;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.18, transparent: true, opacity: 0.55 });
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.visible = false;
    scene.add(rain);

    // ── Fireworks & milestone celebration ───────────────────────────────
    type FireworkShell = {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      exploded: boolean;
      explodeAt: number;
      color: number;
    };
    let fireworks: FireworkShell[] = [];
    const fwColors = [0xff2244, 0xff8800, 0xffee00, 0x44ff88, 0x44aaff, 0xcc44ff, 0xffffff, 0xff44cc];

    const launchFirework = (cx: number, cz: number) => {
      const color = fwColors[Math.floor(Math.random() * fwColors.length)];
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 4),
        new THREE.MeshBasicMaterial({ color })
      );
      shell.position.set(cx + (Math.random() - 0.5) * 6, 0.5, cz + (Math.random() - 0.5) * 4);
      scene.add(shell);
      fireworks.push({
        mesh: shell,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.12, 0.4 + Math.random() * 0.2, (Math.random() - 0.5) * 0.08),
        life: 1,
        exploded: false,
        explodeAt: 12 + Math.random() * 6,
        color,
      });
    };

    const explodeFirework = (fw: FireworkShell) => {
      fw.exploded = true;
      scene.remove(fw.mesh);
      const pos = fw.mesh.position;
      for (let i = 0; i < 28; i++) {
        const spark = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 4, 3),
          new THREE.MeshBasicMaterial({ color: fw.color })
        );
        spark.position.copy(pos);
        const angle = Math.random() * Math.PI * 2;
        const elev = (Math.random() - 0.3) * Math.PI;
        const spd = 0.18 + Math.random() * 0.22;
        scene.add(spark);
        bursts.push({
          mesh: spark,
          vel: new THREE.Vector3(
            Math.cos(angle) * Math.cos(elev) * spd,
            Math.sin(elev) * spd + 0.04,
            Math.sin(angle) * Math.cos(elev) * spd,
          ),
          life: 1.0,
        });
      }
    };

    const triggerCelebration = (level = 0) => {
      // Scale fireworks and balloons with milestone level
      const fwCount = Math.min(30, 8 + level * 4);
      const fwDelay = Math.max(120, 380 - level * 25);
      const extraBalloons = Math.min(40, 12 + level * 5);
      // Launch fireworks with staggered delays
      for (let i = 0; i < fwCount; i++) {
        setTimeout(() => launchFirework((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 12), i * fwDelay);
      }
      // Release a burst of balloons
      for (const b of balloons) {
        b.mesh.visible = true;
        b.mesh.position.set(b.x + (Math.random() - 0.5) * 10, b.startY, b.z + (Math.random() - 0.5) * 6);
      }
      // Spawn extra celebration balloons that fade out
      for (let i = 0; i < extraBalloons; i++) {
        const color = balloonColors[i % balloonColors.length];
        const cbm = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 10, 10),
          new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 1 })
        );
        cbm.position.set((Math.random() - 0.5) * 22, 1 + Math.random() * 3, (Math.random() - 0.5) * 12);
        scene.add(cbm);
        setTimeout(() => {
          let life = 1;
          const fade = setInterval(() => {
            life -= 0.015;
            (cbm.material as THREE.MeshLambertMaterial).opacity = Math.max(0, life);
            cbm.position.y += 0.04;
            if (life <= 0) { scene.remove(cbm); clearInterval(fade); }
          }, 16);
        }, i * 200);
      }
    };

    celebrateRef.current = triggerCelebration;
    celebrateTriggerRef.current = triggerCelebration;

    // Burst system
    let bursts: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
    burstEmitterRef.current = (pos: THREE.Vector3, color: number) => {
      for (let i = 0; i < 16; i++) {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.08),
          new THREE.MeshBasicMaterial({ color })
        );
        m.position.copy(pos);
        scene.add(m);
        bursts.push({
          mesh: m,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            Math.random() * 0.3 + 0.1,
            (Math.random() - 0.5) * 0.3
          ),
          life: 1.0,
        });
      }
    };

    // Seed any attractions that were already in state before the scene was ready
    for (const a of attractionsRef.current) {
      if (renderedRef.current.has(a.id)) continue;
      renderedRef.current.add(a.id);
      addBranchPath(a.x, a.z, a.id);
      const group = new THREE.Group();
      scene.add(group);
      const result = buildAttraction(group, a);
      attractionGroupsRef.current.set(a.id, { group, x: a.x, z: a.z });
      animatorsRef.current.push({ id: a.id, fn: result.animator });
      const { clickTargets, burstColor } = result;
      clickablesRef.current.push({
        id: a.id,
        objects: clickTargets,
        onHit: (pos) => { burstEmitterRef.current?.(pos, burstColor); },
      });
    }

    // Ghost placement indicator
    const ghostMat = new THREE.MeshLambertMaterial({ color: 0x00ff88, transparent: true, opacity: 0.45 });
    const ghost = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.12, 32), ghostMat);
    ghost.visible = false;
    scene.add(ghost);
    ghostRef.current = ghost;
    ghostMatRef.current = ghostMat;

    // Invisible ground plane for placement raycasting
    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    scene.add(groundPlane);

    // Camera orbit
    let isDragging = false;
    let dragMoved = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragMoved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      mount.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
        lastX = e.clientX;
        lastY = e.clientY;
        cameraTheta -= dx * 0.006;
        cameraPhi = Math.max(0.15, Math.min(Math.PI / 2.2, cameraPhi + dy * 0.005));
      }

      // Ghost preview when placing (not when demolishing)
      const isPlacing = !demolishingRef.current && (placingTypeRef.current || placingShopTypeRef.current);
      if (isPlacing) {
        const rect = mount.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(groundPlane);
        if (hits.length > 0) {
          const pt = hits[0].point;
          ghost.position.set(pt.x, 0.06, pt.z);
          ghost.visible = true;
          const isShop = !!placingShopTypeRef.current;
          const attrDist = isShop ? 5 : 7;
          const shopDist = isShop ? 4 : 5;
          const valid =
            pt.z < 8.5 &&
            Math.abs(pt.x) < 44 &&
            attractionsRef.current.every((a) => Math.hypot(a.x - pt.x, a.z - pt.z) > attrDist) &&
            shopsRef.current.every((s) => Math.hypot(s.x - pt.x, s.z - pt.z) > shopDist);
          ghostMat.color.set(valid ? 0x00ff88 : 0xff4444);
        }
      } else {
        ghost.visible = false;
      }
    };
    const onPointerUp = () => {
      isDragging = false;
      mount.style.cursor = (demolishingRef.current || placingTypeRef.current || placingShopTypeRef.current) ? "crosshair" : "grab";
    };

    // Raycaster
    const raycaster = new THREE.Raycaster();

    const onClick = (e: MouseEvent) => {
      if (dragMoved) return;
      const rect = mount.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);

      // Demolish click — checks both attractions and shops
      if (demolishingRef.current) {
        type DemolishObj = { obj: THREE.Object3D; id: string; kind: "attraction" | "shop" };
        const demolishObjs: DemolishObj[] = [];
        for (const [id, info] of attractionGroupsRef.current) {
          info.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) demolishObjs.push({ obj: o, id, kind: "attraction" }); });
        }
        for (const [id, info] of shopGroupsRef.current) {
          info.group.traverse((o) => { if ((o as THREE.Mesh).isMesh) demolishObjs.push({ obj: o, id, kind: "shop" }); });
        }
        const hits = raycaster.intersectObjects(demolishObjs.map((d) => d.obj), true);
        if (hits.length > 0) {
          const entry = demolishObjs.find((d) => d.obj === hits[0].object);
          if (entry) {
            if (entry.kind === "attraction") onDemolishRef.current(entry.id);
            else onDemolishShopRef.current(entry.id);
          }
        }
        return;
      }

      // Attraction placement click
      if (placingTypeRef.current) {
        const hits = raycaster.intersectObject(groundPlane);
        if (hits.length > 0) {
          const pt = hits[0].point;
          onPlaceRef.current(pt.x, pt.z);
        }
        return;
      }

      // Shop placement click
      if (placingShopTypeRef.current) {
        const hits = raycaster.intersectObject(groundPlane);
        if (hits.length > 0) {
          const pt = hits[0].point;
          onPlaceShopRef.current(pt.x, pt.z);
        }
        return;
      }

      // Burst click
      const allObjects = clickablesRef.current.flatMap((c) => c.objects);
      const hits = raycaster.intersectObjects(allObjects, true);
      if (hits.length > 0) {
        const hitPos = hits[0].point;
        for (const c of clickablesRef.current) {
          if (c.objects.some((o) => hits[0].object === o || o.getObjectById(hits[0].object.id))) {
            c.onHit(hitPos);
            break;
          }
        }
      }
    };

    // Zoom via mouse wheel / touchpad pinch
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraRadius = Math.max(12, Math.min(60, cameraRadius + e.deltaY * 0.04));
    };
    mount.addEventListener("wheel", onWheel, { passive: false });

    mount.style.cursor = "grab";
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointerleave", onPointerUp);
    mount.addEventListener("click", onClick);

    // Animation loop
    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      mount.style.cursor = (demolishingRef.current || placingTypeRef.current || placingShopTypeRef.current)
        ? "crosshair"
        : isDragging
        ? "grabbing"
        : "grab";

      // Camera orbit
      camera.position.set(
        cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta),
        cameraTarget.y + cameraRadius * Math.cos(cameraPhi),
        cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta)
      );
      camera.lookAt(cameraTarget);

      // Weather tick
      weatherTimer += 0.01;
      if (weatherTimer >= weatherDuration) {
        weatherTimer = 0;
        weatherDuration = 15 + Math.random() * 15;
        currentWeather = pickNextWeather();
        applyWeatherClouds(currentWeather);
        rain.visible = currentWeather === "rainy";
        onWeatherChangeRef.current(currentWeather);
      }
      // Rain animation
      if (rain.visible) {
        const pos = rainGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < RAIN_COUNT; i++) {
          pos.array[i * 3 + 1] -= 0.35;
          if (pos.array[i * 3 + 1] < 0) {
            pos.array[i * 3 + 1] = 22 + Math.random() * 4;
            pos.array[i * 3]     = (Math.random() - 0.5) * 80;
            pos.array[i * 3 + 2] = (Math.random() - 0.5) * 60;
          }
        }
        pos.needsUpdate = true;
      }

      // Run attraction animators
      for (const { fn } of animatorsRef.current) fn(t);

      // Vehicles
      vehicles.forEach((v) => {
        v.group.position.x += v.speed;
        if (v.speed > 0 && v.group.position.x > v.resetTo) v.group.position.x = v.resetFrom;
        else if (v.speed < 0 && v.group.position.x < v.resetTo) v.group.position.x = v.resetFrom;
      });

      // Clouds — drift left to right, wrap around
      clouds.forEach((c) => {
        c.group.position.x += c.speed;
        if (c.group.position.x > 75) c.group.position.x = -75;
      });

      // Balloons
      balloons.forEach((b) => {
        b.mesh.position.y += b.speed;
        b.mesh.position.x += Math.sin(t * 0.5 + b.startY) * 0.003;
        if (b.mesh.position.y > 18) b.mesh.position.set(b.x, b.startY, b.z);
      });

      // Show people proportionally to current visitors
      const visibleCount = Math.min(people.length, Math.round((currentVisitorsRef.current / Math.max(1, 80)) * people.length));
      people.forEach((p, i) => { p.group.visible = i < visibleCount; });

      // People — follow waypoint routes
      people.forEach((p) => {
        const from = p.dir === 1 ? p.waypoints[p.segIdx] : p.waypoints[p.segIdx + 1];
        const to   = p.dir === 1 ? p.waypoints[p.segIdx + 1] : p.waypoints[p.segIdx];
        const segLen = from.distanceTo(to);
        p.t += p.speed / Math.max(0.1, segLen);
        if (p.t >= 1) {
          p.t = 0;
          if (p.dir === 1) {
            if (p.segIdx < p.waypoints.length - 2) p.segIdx++;
            else p.dir = -1;
          } else {
            if (p.segIdx > 0) p.segIdx--;
            else p.dir = 1;
          }
        }
        p.group.position.lerpVectors(from, to, p.t);
        p.group.lookAt(to.clone().setY(p.group.position.y));
        const swing = Math.sin(t * 8) * 0.3;
        if (p.isFamily) {
          [p.group.userData.adult1, p.group.userData.adult2, p.group.userData.child].forEach((member: THREE.Group) => {
            const l0 = member?.getObjectByName("leg0");
            const l1 = member?.getObjectByName("leg1");
            if (l0) l0.rotation.x = swing;
            if (l1) l1.rotation.x = -swing;
          });
        } else {
          const leg0 = p.group.getObjectByName("leg0");
          const leg1 = p.group.getObjectByName("leg1");
          if (leg0) leg0.rotation.x = swing;
          if (leg1) leg1.rotation.x = -swing;
        }
      });

      // Fireworks — rise then explode
      fireworks = fireworks.filter((fw) => {
        if (fw.exploded) return false;
        fw.mesh.position.add(fw.vel);
        fw.vel.y -= 0.005;
        fw.explodeAt -= 1;
        if (fw.explodeAt <= 0 || fw.mesh.position.y > 22) {
          explodeFirework(fw);
          return false;
        }
        return true;
      });

      // Bursts
      bursts = bursts.filter((b) => {
        b.life -= 0.04;
        b.mesh.position.add(b.vel);
        b.vel.y -= 0.01;
        (b.mesh.material as THREE.MeshBasicMaterial).opacity = b.life;
        (b.mesh.material as THREE.MeshBasicMaterial).transparent = true;
        if (b.life <= 0) { scene.remove(b.mesh); return false; }
        return true;
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointerleave", onPointerUp);
      mount.removeEventListener("click", onClick);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      // Reset mutable refs so a remount (React StrictMode) starts clean
      renderedRef.current.clear();
      animatorsRef.current = [];
      clickablesRef.current = [];
      sceneRef.current = null;
      addPathFnRef.current = null;
      burstEmitterRef.current = null;
      celebrateTriggerRef.current = null;
      attractionGroupsRef.current.clear();
      shopGroupsRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

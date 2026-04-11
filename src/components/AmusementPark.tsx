import { useEffect, useRef } from "react";
import * as THREE from "three";

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

// Burst particles on click
function createBurst(scene: THREE.Scene, pos: THREE.Vector3, color: number) {
  const particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.08),
      new THREE.MeshBasicMaterial({ color })
    );
    m.position.copy(pos);
    scene.add(m);
    particles.push({
      mesh: m,
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.3 + 0.1, (Math.random() - 0.5) * 0.3),
      life: 1.0,
    });
  }
  return particles;
}

export default function AmusementPark() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth, H = mount.clientHeight;
    const theme = getTimeOfDay() === "day" ? DAY : NIGHT;
    const isNight = getTimeOfDay() === "night";

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.Fog(theme.sky, 30, 80);

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 4, 0);

    scene.add(new THREE.AmbientLight(theme.ambient, 0.8));
    const sun = new THREE.DirectionalLight(theme.light, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshLambertMaterial({ color: theme.ground })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road
    const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 2.5), new THREE.MeshLambertMaterial({ color: 0x555555 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 5);
    scene.add(road);
    for (let i = -4; i <= 4; i++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), new THREE.MeshLambertMaterial({ color: 0xffff00 }));
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i * 4, 0.02, 5);
      scene.add(dash);
    }

    // Clickable objects registry
    const clickables: { objects: THREE.Object3D[]; onHit: (pos: THREE.Vector3) => void }[] = [];

    // --- Ferris Wheel ---
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-6, 0, 0);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xcc4444 });
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
    [-1.2, 1.2].forEach((x) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8), poleMat);
      pole.position.set(x, 4, 0);
      wheelGroup.add(pole);
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.12, 8, 48), ringMat);
    ring.position.set(0, 8, 0);
    wheelGroup.add(ring);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.5), ringMat);
      spoke.position.set(0, 8, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      spoke.translateY(1.75);
      wheelGroup.add(spoke);
    }
    const gondolaColors = [0xff6699, 0x66ccff, 0xffaa33, 0x99ff66, 0xcc66ff, 0xff4444, 0x44ffee, 0xffee44];
    const gondolas: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gondola = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.4), new THREE.MeshLambertMaterial({ color: gondolaColors[i] }));
      gondola.position.set(wheelGroup.position.x + Math.cos(angle) * 3.5, 8 + Math.sin(angle) * 3.5, 0);
      gondolas.push(gondola);
      scene.add(gondola);
    }
    scene.add(wheelGroup);
    clickables.push({ objects: [ring, ...gondolas], onHit: (pos) => { bursts.push(...createBurst(scene, pos, 0xffdd00)); } });

    // --- Roller Coaster ---
    const coasterGroup = new THREE.Group();
    coasterGroup.position.set(4, 0, -2);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t2 = (i / 60) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t2) * 5, 2 + Math.sin(t2 * 2) * 2 + (t2 < Math.PI ? t2 * 0.5 : (Math.PI * 2 - t2) * 0.5), Math.sin(t2) * 3));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    coasterGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.08, 6, true), trackMat));
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), new THREE.MeshLambertMaterial({ color: 0xff3300 }));
    coasterGroup.add(cart);
    scene.add(coasterGroup);
    clickables.push({ objects: [cart], onHit: (pos) => { bursts.push(...createBurst(scene, pos, 0xff3300)); } });

    // --- Coffee Cups ---
    const cupGroup = new THREE.Group();
    cupGroup.position.set(6, 0, 5);
    cupGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.15, 32), new THREE.MeshLambertMaterial({ color: 0xee88ff })));
    const cupColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88];
    const cups: { outer: THREE.Group; inner: THREE.Group }[] = [];
    const cupMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const outer = new THREE.Group();
      outer.position.set(Math.cos(angle) * 1.4, 0.15, Math.sin(angle) * 1.4);
      const inner = new THREE.Group();
      const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.5, 16), new THREE.MeshLambertMaterial({ color: cupColors[i] }));
      cupMesh.position.y = 0.25;
      inner.add(cupMesh);
      inner.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16), new THREE.MeshLambertMaterial({ color: 0xffffff })));
      outer.add(inner);
      cupGroup.add(outer);
      cups.push({ outer, inner });
      cupMeshes.push(cupMesh);
    }
    scene.add(cupGroup);
    clickables.push({ objects: cupMeshes, onHit: (pos) => { bursts.push(...createBurst(scene, pos, 0xee88ff)); } });

    // --- Merry-Go-Round ---
    const merryGroup = new THREE.Group();
    merryGroup.position.set(-12, 0, 4);
    // center pole
    merryGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), new THREE.MeshLambertMaterial({ color: 0xffaacc })));
    // roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0xff66aa }));
    roof.position.y = 3.6;
    merryGroup.add(roof);
    // platform
    merryGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.15, 32), new THREE.MeshLambertMaterial({ color: 0xffddee })));
    // horses
    const horseColors = [0xffffff, 0xffcc88, 0xaaddff, 0xffaacc];
    const horses: { group: THREE.Group; baseY: number; phase: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const hg = new THREE.Group();
      hg.position.set(Math.cos(angle) * 1.4, 0.5, Math.sin(angle) * 1.4);
      // pole
      hg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2), new THREE.MeshLambertMaterial({ color: 0xdddddd })));
      // body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.2), new THREE.MeshLambertMaterial({ color: horseColors[i] }));
      body.position.y = 0.8;
      hg.add(body);
      // head
      const hhead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), new THREE.MeshLambertMaterial({ color: horseColors[i] }));
      hhead.position.set(0.3, 1.05, 0);
      hg.add(hhead);
      merryGroup.add(hg);
      horses.push({ group: hg, baseY: 0.5, phase: (i / 4) * Math.PI * 2 });
    }
    scene.add(merryGroup);
    clickables.push({ objects: [roof, ...horses.map(h => h.group.children[1] as THREE.Mesh)], onHit: (pos) => { bursts.push(...createBurst(scene, pos, 0xff66aa)); } });

    // --- Shooting Gallery (射的) ---
    const shootGroup = new THREE.Group();
    shootGroup.position.set(-13, 0, -3);
    // booth frame
    const boothMat = new THREE.MeshLambertMaterial({ color: 0xcc8844 });
    shootGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.2), boothMat), { position: new THREE.Vector3(0, 1.25, 0) }));
    shootGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 1.5), boothMat), { position: new THREE.Vector3(-1.5, 1.25, -0.7) }));
    shootGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 1.5), boothMat), { position: new THREE.Vector3(1.5, 1.25, -0.7) }));
    // targets
    const targetColors = [0xff2222, 0x2222ff, 0x22ff22, 0xffff22, 0xff22ff];
    const targets: { mesh: THREE.Mesh; fallen: boolean; resetT: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const target = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), new THREE.MeshLambertMaterial({ color: targetColors[i] }));
      target.position.set(-1 + i * 0.5, 1.8, -0.1);
      shootGroup.add(target);
      targets.push({ mesh: target, fallen: false, resetT: 0 });
    }
    scene.add(shootGroup);
    clickables.push({
      objects: targets.map(t => t.mesh),
      onHit: (pos) => {
        const hit = targets.find(t => !t.fallen && t.mesh.getWorldPosition(new THREE.Vector3()).distanceTo(pos) < 1.5);
        if (hit) { hit.fallen = true; hit.resetT = 3; bursts.push(...createBurst(scene, pos, 0xffff00)); }
      }
    });

    // --- Mini Train ---
    const trainGroup = new THREE.Group();
    trainGroup.position.set(0, 0, -8);
    // circular track
    const trainRadius = 5;
    const trackPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      trackPoints.push(new THREE.Vector3(Math.cos(a) * trainRadius, 0.05, Math.sin(a) * trainRadius));
    }
    const trainCurve = new THREE.CatmullRomCurve3(trackPoints, true);
    trainGroup.add(new THREE.Mesh(new THREE.TubeGeometry(trainCurve, 128, 0.06, 6, true), new THREE.MeshLambertMaterial({ color: 0x888888 })));
    // train cars
    const trainCarColors = [0xff4400, 0xffaa00, 0x44cc00];
    const trainCars: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), new THREE.MeshLambertMaterial({ color: trainCarColors[i] }));
      trainGroup.add(car);
      trainCars.push(car);
    }
    scene.add(trainGroup);
    clickables.push({ objects: trainCars, onHit: (pos) => { bursts.push(...createBurst(scene, pos, 0xff4400)); } });

    // --- Balloons ---
    const balloons: { mesh: THREE.Mesh; speed: number; startY: number; x: number; z: number }[] = [];
    const balloonColors = [0xff2222, 0xff8800, 0xffff00, 0x00cc44, 0x2288ff, 0xcc44ff, 0xff44aa];
    for (let i = 0; i < 12; i++) {
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshLambertMaterial({ color: balloonColors[i % balloonColors.length] }));
      const bx = (Math.random() - 0.5) * 20, bz = (Math.random() - 0.5) * 10, startY = Math.random() * 8 + 1;
      balloon.position.set(bx, startY, bz);
      const strGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.5, 0)]);
      balloon.add(new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
      scene.add(balloon);
      balloons.push({ mesh: balloon, speed: 0.008 + Math.random() * 0.012, startY, x: bx, z: bz });
    }

    // --- People ---
    const personColors = [0xff9966, 0x66aaff, 0xffcc44, 0xcc66ff, 0x44ddaa, 0xff6644, 0xaaddff, 0xffaacc];
    const paths = [
      [new THREE.Vector3(-10, 0, 4.5), new THREE.Vector3(10, 0, 4.5)],
      [new THREE.Vector3(10, 0, 5.5), new THREE.Vector3(-10, 0, 5.5)],
      [new THREE.Vector3(-8, 0, 4.8), new THREE.Vector3(8, 0, 4.8)],
    ];
    const people: { group: THREE.Group; walkT: number; speed: number; path: THREE.Vector3[] }[] = [];
    for (let i = 0; i < 8; i++) {
      const person = makePerson(personColors[i % personColors.length]);
      const path = paths[i % paths.length];
      const wt = Math.random();
      person.position.lerpVectors(path[0], path[1], wt);
      scene.add(person);
      people.push({ group: person, walkT: wt, speed: (0.001 + Math.random() * 0.002) * (i % 2 === 0 ? 1 : -1), path });
    }

    // Flags
    const flagColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3), new THREE.MeshLambertMaterial({ color: 0x888888 }));
      pole.position.set(-8 + i * 4, 1.5, 6);
      scene.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshLambertMaterial({ color: flagColors[i], side: THREE.DoubleSide }));
      flag.position.set(-8 + i * 4 + 0.4, 2.8, 6);
      scene.add(flag);
    }

    if (isNight) {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600);
      for (let i = 0; i < 600; i += 3) { starPos[i] = (Math.random() - 0.5) * 100; starPos[i + 1] = Math.random() * 40 + 10; starPos[i + 2] = (Math.random() - 0.5) * 100; }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })));
    }

    // Burst particles pool
    let bursts: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

    // Raycaster for click
    const raycaster = new THREE.Raycaster();
    const allClickableObjects = clickables.flatMap(c => c.objects);
    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allClickableObjects, true);
      if (hits.length > 0) {
        const hitPos = hits[0].point;
        for (const c of clickables) {
          if (c.objects.some(o => hits[0].object === o || o.getObjectById(hits[0].object.id))) {
            c.onHit(hitPos);
            break;
          }
        }
      }
    };
    mount.addEventListener("click", onClick);

    // Animation
    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      // Ferris wheel
      ring.rotation.z += 0.005;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.005 * Math.PI * 2;
        gondolas[i].position.set(wheelGroup.position.x + Math.cos(angle) * 3.5, 8 + Math.sin(angle) * 3.5, 0);
        gondolas[i].rotation.z = -angle;
      }

      // Coaster
      const pos = curve.getPoint((t * 0.05) % 1);
      const tangent = curve.getTangent((t * 0.05) % 1);
      cart.position.copy(pos);
      cart.lookAt(pos.clone().add(tangent));

      // Coffee cups
      cupGroup.rotation.y += 0.008;
      cups.forEach((c, i) => {
        c.outer.rotation.y = t * 0.5 * (i % 2 === 0 ? 1 : -1);
        c.inner.rotation.y = t * 1.2 * (i % 2 === 0 ? -1 : 1);
      });

      // Merry-go-round
      merryGroup.rotation.y += 0.012;
      horses.forEach((h) => {
        h.group.position.y = h.baseY + Math.sin(t * 2 + h.phase) * 0.3;
      });

      // Targets reset
      targets.forEach((tgt) => {
        if (tgt.fallen) {
          tgt.mesh.rotation.x = Math.PI / 2;
          tgt.resetT -= 0.016;
          if (tgt.resetT <= 0) { tgt.fallen = false; tgt.mesh.rotation.x = 0; }
        }
      });

      // Mini train
      for (let i = 0; i < 3; i++) {
        const offset = (t * 0.03 + i * 0.05) % 1;
        const tp = trainCurve.getPoint(offset);
        const tt = trainCurve.getTangent(offset);
        trainCars[i].position.copy(tp).add(trainGroup.position);
        trainCars[i].position.y = 0.25;
        trainCars[i].lookAt(tp.clone().add(tt).add(trainGroup.position));
      }

      // Balloons
      balloons.forEach((b) => {
        b.mesh.position.y += b.speed;
        b.mesh.position.x += Math.sin(t * 0.5 + b.startY) * 0.003;
        if (b.mesh.position.y > 18) b.mesh.position.set(b.x, b.startY, b.z);
      });

      // People
      people.forEach((p) => {
        p.walkT += p.speed;
        if (p.walkT > 1) p.walkT = 0;
        if (p.walkT < 0) p.walkT = 1;
        const from = p.speed > 0 ? p.path[0] : p.path[1];
        const to = p.speed > 0 ? p.path[1] : p.path[0];
        p.group.position.lerpVectors(from, to, Math.abs(p.walkT));
        p.group.lookAt(to.clone().setY(p.group.position.y));
        const swing = Math.sin(t * 8) * 0.3;
        const leg0 = p.group.getObjectByName("leg0");
        const leg1 = p.group.getObjectByName("leg1");
        if (leg0) leg0.rotation.x = swing;
        if (leg1) leg1.rotation.x = -swing;
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
      mount.removeEventListener("click", onClick);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "pointer" }} />;
}

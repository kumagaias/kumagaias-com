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
  // body
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4), mat), { position: new THREE.Vector3(0, 0.2, 0) }));
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13), mat);
  head.position.set(0, 0.55, 0);
  g.add(head);
  // legs
  [-0.07, 0.07].forEach((x, i) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3), mat);
    leg.position.set(x, -0.05, 0);
    leg.name = `leg${i}`;
    g.add(leg);
  });
  return g;
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

    // Road (horizontal path)
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 2.5),
      new THREE.MeshLambertMaterial({ color: 0x555555 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 5);
    scene.add(road);
    // Road center line
    for (let i = -4; i <= 4; i++) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.12),
        new THREE.MeshLambertMaterial({ color: 0xffff00 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i * 4, 0.02, 5);
      scene.add(dash);
    }

    // --- Ferris Wheel ---
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-6, 0, 0);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xcc4444 });
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
    [-1.2, 1.2].forEach((x) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8), poleMat);
      pole.position.set(x, 4, 0);
      pole.castShadow = true;
      wheelGroup.add(pole);
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.12, 8, 48), ringMat);
    ring.position.set(0, 8, 0);
    wheelGroup.add(ring);
    // spokes
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
      const gondola = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 0.4),
        new THREE.MeshLambertMaterial({ color: gondolaColors[i] })
      );
      gondola.position.set(
        wheelGroup.position.x + Math.cos(angle) * 3.5,
        8 + Math.sin(angle) * 3.5,
        0
      );
      gondola.castShadow = true;
      gondolas.push(gondola);
      scene.add(gondola);
    }
    scene.add(wheelGroup);

    // --- Roller Coaster ---
    const coasterGroup = new THREE.Group();
    coasterGroup.position.set(4, 0, -2);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(t) * 5,
        2 + Math.sin(t * 2) * 2 + (t < Math.PI ? t * 0.5 : (Math.PI * 2 - t) * 0.5),
        Math.sin(t) * 3
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    coasterGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.08, 6, true), trackMat));
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), new THREE.MeshLambertMaterial({ color: 0xff3300 }));
    cart.castShadow = true;
    coasterGroup.add(cart);
    scene.add(coasterGroup);

    // --- Coffee Cups ---
    const cupGroup = new THREE.Group();
    cupGroup.position.set(6, 0, 5);
    const platformGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.15, 32);
    cupGroup.add(new THREE.Mesh(platformGeo, new THREE.MeshLambertMaterial({ color: 0xee88ff })));
    const cupColors = [0xff4488, 0x44aaff, 0xffcc00, 0x44ff88];
    const cups: { outer: THREE.Group; inner: THREE.Group }[] = [];
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
      // saucer
      inner.add(new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      ));
      outer.add(inner);
      cupGroup.add(outer);
      cups.push({ outer, inner });
    }
    scene.add(cupGroup);

    // --- Balloons ---
    const balloons: { mesh: THREE.Mesh; speed: number; startY: number; x: number; z: number }[] = [];
    const balloonColors = [0xff2222, 0xff8800, 0xffff00, 0x00cc44, 0x2288ff, 0xcc44ff, 0xff44aa];
    for (let i = 0; i < 12; i++) {
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 12),
        new THREE.MeshLambertMaterial({ color: balloonColors[i % balloonColors.length] })
      );
      const bx = (Math.random() - 0.5) * 20;
      const bz = (Math.random() - 0.5) * 10;
      const startY = Math.random() * 8 + 1;
      balloon.position.set(bx, startY, bz);
      // string
      const strGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.5, 0)
      ]);
      balloon.add(new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
      scene.add(balloon);
      balloons.push({ mesh: balloon, speed: 0.008 + Math.random() * 0.012, startY, x: bx, z: bz });
    }

    // --- People ---
    const personColors = [0xff9966, 0x66aaff, 0xffcc44, 0xcc66ff, 0x44ddaa, 0xff6644, 0xaaddff, 0xffaacc];
    const people: { group: THREE.Group; walkT: number; speed: number; path: THREE.Vector3[] }[] = [];
    // Walking paths along road
    const paths = [
      [new THREE.Vector3(-10, 0, 4.5), new THREE.Vector3(10, 0, 4.5)],
      [new THREE.Vector3(10, 0, 5.5), new THREE.Vector3(-10, 0, 5.5)],
      [new THREE.Vector3(-8, 0, 4.8), new THREE.Vector3(8, 0, 4.8)],
    ];
    for (let i = 0; i < 8; i++) {
      const person = makePerson(personColors[i % personColors.length]);
      const path = paths[i % paths.length];
      const t = Math.random();
      person.position.lerpVectors(path[0], path[1], t);
      scene.add(person);
      people.push({ group: person, walkT: t, speed: (0.001 + Math.random() * 0.002) * (i % 2 === 0 ? 1 : -1), path });
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

    // Stars (night)
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

    // Animation
    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      // Ferris wheel
      ring.rotation.z += 0.005;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.005 * (2 * Math.PI);
        gondolas[i].position.set(
          wheelGroup.position.x + Math.cos(angle) * 3.5,
          8 + Math.sin(angle) * 3.5,
          0
        );
        gondolas[i].rotation.z = -angle;
      }

      // Coaster cart
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

      // Balloons float up and reset
      balloons.forEach((b) => {
        b.mesh.position.y += b.speed;
        b.mesh.position.x += Math.sin(t * 0.5 + b.startY) * 0.003;
        if (b.mesh.position.y > 18) {
          b.mesh.position.set(b.x, b.startY, b.z);
        }
      });

      // People walk
      people.forEach((p) => {
        p.walkT += p.speed;
        if (p.walkT > 1) p.walkT = 0;
        if (p.walkT < 0) p.walkT = 1;
        const from = p.speed > 0 ? p.path[0] : p.path[1];
        const to = p.speed > 0 ? p.path[1] : p.path[0];
        p.group.position.lerpVectors(from, to, Math.abs(p.walkT));
        p.group.lookAt(to.clone().add(new THREE.Vector3(0, p.group.position.y, 0)));
        // leg swing
        const swing = Math.sin(t * 8) * 0.3;
        const leg0 = p.group.getObjectByName("leg0");
        const leg1 = p.group.getObjectByName("leg1");
        if (leg0) leg0.rotation.x = swing;
        if (leg1) leg1.rotation.x = -swing;
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
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

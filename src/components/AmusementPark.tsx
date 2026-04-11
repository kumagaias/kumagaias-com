import { useEffect, useRef } from "react";
import * as THREE from "three";

function getTimeOfDay(): "day" | "night" {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

const DAY = { sky: 0x87ceeb, ground: 0x90ee90, light: 0xffffff, ambient: 0xffd580 };
const NIGHT = { sky: 0x0a0a2e, ground: 0x2d4a1e, light: 0x8888ff, ambient: 0x222244 };

export default function AmusementPark() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth;
    const H = mount.clientHeight;
    const theme = getTimeOfDay() === "day" ? DAY : NIGHT;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.sky);
    scene.fog = new THREE.Fog(theme.sky, 30, 80);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 4, 0);

    // Lights
    const ambient = new THREE.AmbientLight(theme.ambient, 0.8);
    scene.add(ambient);
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

    // --- Ferris Wheel ---
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-6, 0, 0);

    // Support poles
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xcc4444 });
    [-1.2, 1.2].forEach((x) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 4, 0);
      pole.castShadow = true;
      wheelGroup.add(pole);
    });

    // Wheel ring
    const ringGeo = new THREE.TorusGeometry(3.5, 0.12, 8, 48);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 8, 0);
    ring.castShadow = true;
    wheelGroup.add(ring);

    // Spokes + gondolas
    const gondolaColors = [0xff6699, 0x66ccff, 0xffaa33, 0x99ff66, 0xcc66ff, 0xff4444];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spokeGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.5);
      const spoke = new THREE.Mesh(spokeGeo, ringMat);
      spoke.position.set(0, 8, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      spoke.translateY(1.75);
      wheelGroup.add(spoke);

      const gondola = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 0.4),
        new THREE.MeshLambertMaterial({ color: gondolaColors[i % gondolaColors.length] })
      );
      gondola.position.set(
        Math.cos(angle) * 3.5,
        8 + Math.sin(angle) * 3.5,
        0
      );
      gondola.castShadow = true;
      wheelGroup.add(gondola);
    }

    scene.add(wheelGroup);

    // --- Roller Coaster (simplified track loop) ---
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
    const trackGeo = new THREE.TubeGeometry(curve, 120, 0.08, 6, true);
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.castShadow = true;
    coasterGroup.add(track);

    // Cart
    const cartMat = new THREE.MeshLambertMaterial({ color: 0xff3300 });
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), cartMat);
    cart.castShadow = true;
    coasterGroup.add(cart);

    scene.add(coasterGroup);

    // --- Stars (night only) ---
    if (getTimeOfDay() === "night") {
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600);
      for (let i = 0; i < 600; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 100;
        starPos[i + 1] = Math.random() * 40 + 10;
        starPos[i + 2] = (Math.random() - 0.5) * 100;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 }));
      scene.add(stars);
    }

    // --- Colorful flags ---
    const flagColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const flagPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3),
        new THREE.MeshLambertMaterial({ color: 0x888888 })
      );
      flagPole.position.set(-8 + i * 4, 1.5, 6);
      scene.add(flagPole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.5),
        new THREE.MeshLambertMaterial({ color: flagColors[i], side: THREE.DoubleSide })
      );
      flag.position.set(-8 + i * 4 + 0.4, 2.8, 6);
      scene.add(flag);
    }

    // Animation
    let frameId: number;
    let t = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      // Ferris wheel rotation
      ring.rotation.z += 0.005;
      wheelGroup.children.forEach((child, i) => {
        if (i > 1 && child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
          // gondolas stay upright (approximate)
          child.rotation.z -= 0.005;
        }
      });

      // Cart along coaster
      const pos = curve.getPoint((t * 0.05) % 1);
      const tangent = curve.getTangent((t * 0.05) % 1);
      cart.position.copy(pos);
      cart.lookAt(pos.clone().add(tangent));

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
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

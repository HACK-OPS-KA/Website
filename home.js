/*
 * hackops.tech front page behaviour, plain JavaScript (no build step). The page works without it; this adds:
 *   1. the hero scene: the chrome pyramid from TESSERACT.blend turning over the sky photo (three.js, assets/vendor)
 *   2. slide-open rows (next op steps, FAQ), one open at a time per list
 *   3. the community numbers counting up when they scroll into view
 *   4. previous/next buttons for the game jam winners reel
 * The same page runs on the platform (ops.nedilko.tech/page) as React components; keep the two in step.
 */

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 1. Hero scene ───────────────────────────────────────────────────────────── */

// From TESSERACT.blend: the pyramid's rotation (Euler XYZ), location and scale, the camera distance and lens.
const POSE = { rot: [-5.814338, 0.041652, -0.268165], loc: [-0.084, 1.087, 0.179], scale: 0.937 };
const CAM = { distance: 13.395, hfov: 2 * Math.atan(18 / 50) };
const SIZE = 1.4; // the pyramid is shown larger than in the Blender frame
// Lens shift (fraction of the larger side). Wide: pyramid left of the title; tall: above it.
const shiftFor = (w, h) => (w >= h ? { x: 0.2, y: 0.02 } : { x: 0, y: -0.13 });

async function heroScene(host) {
  if (reducedMotion()) return; // the still pyramid in the markup stays
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, CAM.distance);

  const [sky, gltf] = await Promise.all([
    new THREE.TextureLoader().loadAsync("/assets/home/3d/sky.jpg"),
    new GLTFLoader().loadAsync("/assets/home/3d/pyramid.glb"),
  ]);
  // Reflections: the "Kloofendal partly cloudy pure sky" HDRI (Poly Haven, CC0).
  sky.mapping = THREE.EquirectangularReflectionMapping;
  sky.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(sky).texture;
  pmrem.dispose();

  // Chrome as in the file (white, metallic 1, roughness 0).
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0, side: THREE.DoubleSide });
  const pyramid = gltf.scene;
  pyramid.traverse((o) => {
    if (o.isMesh) o.material = chrome;
  });

  // Blender (Z up, camera on +Y looking -Y) to three (Y up, camera on +Z looking -Z): convert the pose's axes, then
  // turn half way round Y. Blender's Euler XYZ is three's "ZYX".
  const qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(POSE.rot[0], POSE.rot[1], POSE.rot[2], "ZYX"));
  const qPose = new THREE.Quaternion(qB.x, qB.z, -qB.y, qB.w);
  const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  const spin = new THREE.Group();
  spin.add(pyramid);
  spin.scale.setScalar(POSE.scale);
  const pose = new THREE.Group();
  pose.quaternion.copy(flip).multiply(qPose);
  pose.position.set(-POSE.loc[0], POSE.loc[2], POSE.loc[1]);
  pose.add(spin);
  const rig = new THREE.Group();
  rig.scale.setScalar(SIZE);
  rig.add(pose);
  scene.add(rig);

  let w = 1;
  let h = 1;
  const layout = () => {
    w = host.clientWidth || 1;
    h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Blender "auto" sensor fit: the 36 mm sensor spans the larger side.
    camera.fov = THREE.MathUtils.radToDeg(w >= h ? 2 * Math.atan(Math.tan(CAM.hfov / 2) / camera.aspect) : CAM.hfov);
    const big = Math.max(w, h);
    const shift = shiftFor(w, h);
    camera.setViewOffset(w, h, shift.x * big, -shift.y * big, w, h);
    camera.updateProjectionMatrix();
  };
  layout();
  new ResizeObserver(layout).observe(host);

  const skyImg = host.querySelector(".hp-sky img");
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0, s: 0 };
  window.addEventListener(
    "pointermove",
    (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  let running = true;
  let frame = 0;
  let last = performance.now();
  let t = 0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    cur.x += (target.x - cur.x) * 0.04;
    cur.y += (target.y - cur.y) * 0.04;
    cur.s += (Math.min(1, window.scrollY / Math.max(1, h)) - cur.s) * 0.12;

    spin.rotation.y = t * 0.3; // around the pyramid's own axis
    rig.position.y = Math.sin(t * 0.8) * 0.06 + cur.s * 1.6;
    camera.position.set(cur.x * 0.6, -cur.y * 0.35, CAM.distance);
    camera.lookAt(0, 0, 0);
    scene.environmentRotation.set(cur.y * 0.03, Math.PI + t * 0.01 + cur.x * 0.05, 0);
    // The sky photo slides against the pyramid: slow drift, pointer, and a slower scroll than the page.
    if (skyImg) {
      const x = -cur.x * 14 + Math.sin(t * 0.06) * 10;
      const y = -cur.y * 9 + cur.s * h * 0.28;
      skyImg.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(1.08)`;
    }
    renderer.render(scene, camera);
    if (running) frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => (e && e.isIntersecting && !document.hidden ? start() : stop())).observe(host);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  frame = requestAnimationFrame(tick);
  host.classList.add("is-ready");
}

/* ── 2. Slide-open rows ──────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const running = new WeakMap();
const isOpen = (d) => (d.dataset.state ? d.dataset.state === "open" : d.open);

function slide(d, open) {
  const summary = d.querySelector("summary");
  if (!summary) return;
  running.get(d)?.cancel();
  d.dataset.state = open ? "open" : "closed";
  const from = d.getBoundingClientRect().height;
  if (open) d.open = true;
  const style = getComputedStyle(d);
  const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const to = open ? d.scrollHeight + borders : summary.getBoundingClientRect().height + borders;
  if (reducedMotion()) {
    d.open = open;
    return;
  }
  d.style.overflow = "hidden";
  const anim = d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 320, easing: EASE, fill: "forwards" });
  running.set(d, anim);
  anim.onfinish = () => {
    if (!open) d.open = false;
    anim.cancel();
    d.style.overflow = "";
    running.delete(d);
  };
}

function accordions() {
  document.querySelectorAll(".hp details.hp-step, .hp details.hp-q").forEach((d) => {
    d.dataset.state = d.open ? "open" : "closed";
    d.querySelector("summary")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (isOpen(d)) return slide(d, false);
      d.parentElement.querySelectorAll(":scope > details").forEach((o) => o !== d && isOpen(o) && slide(o, false));
      slide(d, true);
    });
  });
}

/* ── 3. Count-up numbers ─────────────────────────────────────────────────────── */

function countUp(root) {
  if (!root || typeof IntersectionObserver === "undefined" || reducedMotion()) return;
  const r = root.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: leave the final numbers
  const nodes = [...root.querySelectorAll("[data-count]")].map((el) => {
    const final = el.textContent;
    el.style.minWidth = `${el.offsetWidth}px`;
    el.textContent = "0";
    return { el, final, to: Number(el.dataset.count) || 0 };
  });
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const begin = performance.now();
      const tick = (now) => {
        let more = false;
        nodes.forEach((n, i) => {
          const dur = n.to >= 10 ? 1400 : 200 + 140 * n.to;
          const t = Math.min(1, Math.max(0, (now - begin - i * 90) / dur));
          if (t < 1) more = true;
          n.el.textContent = t >= 1 ? n.final : String(Math.round(n.to * (1 - (1 - t) ** 4)));
        });
        if (more) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { threshold: 0.3 },
  );
  io.observe(root);
}

/* ── 4. Reel buttons ─────────────────────────────────────────────────────────── */

function reels() {
  document.querySelectorAll(".hp-reel-wrap").forEach((wrap) => {
    const list = wrap.querySelector(".hp-reel");
    const [prev, next] = wrap.querySelectorAll(".hp-reel-btns button");
    const step = (dir) => {
      const card = list?.querySelector("li");
      if (!list || !card) return;
      list.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: reducedMotion() ? "auto" : "smooth" });
    };
    prev?.addEventListener("click", () => step(-1));
    next?.addEventListener("click", () => step(1));
  });
}

accordions();
countUp(document.querySelector(".hp-tally-box"));
reels();
const hero = document.querySelector(".hp-hero-3d");
if (hero) heroScene(hero).catch(() => {}); // no WebGL or a failed load: the still stays

/* 3D clay phone (three.js). Usage:
     import { mountClayPhone } from "./js/clayphone.js";
     mountClayPhone(element, { screen: "path/to/screenshot.png" });   // no screen = the blue placeholder
   The element needs a size; the canvas fills it. three.js comes from the import map in the page (see clay-demo.html). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

var W = 1, H = 2.08, D = 0.035, R = 0.2, BEV = 0.02;

function roundedRect(w, h, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(0, y); // start mid-edge: the last arc ends on (x + r, y), so starting there would double that point and smear the bevel
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function screenGeometry(w, h, r) {
  var g = new THREE.ShapeGeometry(roundedRect(w, h, r), 48), p = g.attributes.position, uv = g.attributes.uv;
  for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}

export function mountClayPhone(el, opts) {
  opts = opts || {};
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; // the dappled-light spotlight needs it on (nothing casts a shadow)
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  el.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // kept low: the forest light below does the work
  var camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 8);

  var clay = new THREE.MeshStandardMaterial({ color: 0xf4c4aa, roughness: 0.8, metalness: 0, envMapIntensity: 0.3 });
    var black = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.3, metalness: 0.1, envMapIntensity: 0.3 });

  var phone = new THREE.Group();

  // the body: a rounded slab with a soft bevel all round
  var body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
    depth: D, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelOffset: -BEV, bevelSegments: 12, curveSegments: 64
  }), clay);
  body.geometry.translate(0, 0, -D / 2);
  phone.add(body);

  var top = D / 2 + BEV; // the z of the front face
  var bezel = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(W - 0.07, H - 0.07, R - 0.035), { depth: 0.006, bevelEnabled: false, curveSegments: 64 }), black);
  bezel.position.z = top - 0.001;
  phone.add(bezel);

  var tex = null;
  var screenMat = new THREE.MeshBasicMaterial({ color: 0x2f7be8 });
  if (opts.screen) {
    tex = new THREE.TextureLoader().load(opts.screen, function () { screenMat.needsUpdate = true; });
    tex.colorSpace = THREE.SRGBColorSpace;
    screenMat.map = tex; screenMat.color.set(0xffffff);
  }
  var screen = new THREE.Mesh(screenGeometry(W - 0.11, H - 0.11, R - 0.055), screenMat);
  screen.position.z = top + 0.006;
  phone.add(screen);

  // ---- forest light: green skylight from the canopy, and warm sun coming through the leaves in patches ----
  scene.add(new THREE.HemisphereLight(0xb7d8a4, 0x213a24, 1.1));

  var c = document.createElement("canvas"); c.width = c.height = 512;
  var g = c.getContext("2d"), seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  g.fillStyle = "#2c3426"; g.fillRect(0, 0, 512, 512); // the shade between the leaves
  if ("filter" in g) g.filter = "blur(7px)";
  for (var i = 0; i < 70; i++) {
    var px = rnd() * 512, py = rnd() * 512, pr = 14 + rnd() * 46;
    var grad = g.createRadialGradient(px, py, 0, px, py, pr);
    grad.addColorStop(0, "rgba(255,255,255," + (0.55 + rnd() * 0.45) + ")"); grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad; g.beginPath(); g.ellipse(px, py, pr, pr * (0.6 + rnd() * 0.5), rnd() * 3, 0, 7); g.fill();
  }
  var dapple = new THREE.CanvasTexture(c);
  dapple.colorSpace = THREE.SRGBColorSpace;
  var sun = new THREE.SpotLight(0xffe2a6, 90, 0, 0.55, 0.7, 2);
  sun.position.set(-2.6, 3.4, 6);
  sun.target.position.set(0, 0, 0);
  sun.map = dapple;
  sun.castShadow = true; // (required for a spotlight's map to show)
  scene.add(sun, sun.target);

  scene.add(phone);

  var baseX = -1.0, baseZ = 0.66, tx = 0, tz = 0, cx = 0, cz = 0;
  function pose() { phone.rotation.set(baseX + cx, 0, baseZ + cz, "XYZ"); }
  pose();

  function size() {
    var w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 26 / (w / h) * 0.9 : 26; // keep it in frame on narrow boxes
    camera.updateProjectionMatrix();
  }
  size();
  if (window.ResizeObserver) new ResizeObserver(size).observe(el); else window.addEventListener("resize", size);

  // a little tilt that follows the pointer
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientY / window.innerHeight - 0.5) * 0.18;
    tz = (e.clientX / window.innerWidth - 0.5) * 0.25;
  });

  var live = true;
  if (window.IntersectionObserver) new IntersectionObserver(function (en) { live = en[0].isIntersecting; }).observe(el);
  (function frame() {
    requestAnimationFrame(frame);
    if (!live) return;
    cx += (tx - cx) * 0.06; cz += (tz - cz) * 0.06;
    pose();
    var t = performance.now() / 1000; sun.position.x = -2.6 + Math.sin(t * 0.35) * 0.35; sun.position.y = 3.4 + Math.cos(t * 0.27) * 0.3; // the light drifts a little, like a breeze in the leaves
    renderer.render(scene, camera);
  })();

  return { setScreen: function (url) { screenMat.map = new THREE.TextureLoader().load(url); screenMat.map.colorSpace = THREE.SRGBColorSpace; screenMat.color.set(0xffffff); screenMat.needsUpdate = true; } };
}

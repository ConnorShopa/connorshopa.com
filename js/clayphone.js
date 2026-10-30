/* 3D clay phone (three.js). Usage:
     import { mountClayPhone } from "./js/clayphone.js";
     mountClayPhone(element, { screen: "path/to/screenshot.png" });   // no screen = the blue placeholder
   The element needs a size; the canvas fills it. three.js comes from the import map in the page (see clay-demo.html). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

var W = 1, H = 2.08, D = 0.085, R = 0.2, BEV = 0.03;

function roundedRect(w, h, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
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

function dial() { // a knurled wheel, axis along y (it sits in the left edge and shows its ridged rim)
  var g = new THREE.CylinderGeometry(0.068, 0.068, 0.11, 96, 1), p = g.attributes.position;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z);
    if (r < 0.01) continue;
    var k = 1 + 0.06 * Math.sign(Math.sin(a * 30)); // the ridges
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function mountClayPhone(el, opts) {
  opts = opts || {};
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  el.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  var camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 8);

  var clay = new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.8, metalness: 0 });
  var dark = new THREE.MeshStandardMaterial({ color: 0x3c3c40, roughness: 0.45, metalness: 0.6 });
  var black = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.3, metalness: 0.1 });
  var orange = new THREE.MeshStandardMaterial({ color: 0xea5a3c, roughness: 0.7, metalness: 0 });

  var phone = new THREE.Group();

  // the body: a rounded slab with a soft bevel all round
  var body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
    depth: D, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelOffset: -BEV, bevelSegments: 12, curveSegments: 64
  }), clay);
  body.geometry.translate(0, 0, -D / 2);
  body.castShadow = body.receiveShadow = true;
  phone.add(body);

  // a thin dark metal band round the middle of the edge
  var band = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(W + 0.008, H + 0.008, R + 0.004), { depth: D * 0.7, bevelEnabled: false, curveSegments: 64 }), dark);
  band.geometry.translate(0, 0, -D * 0.35);
  band.castShadow = true;
  phone.add(band);

  var top = D / 2 + BEV; // the z of the front face
  var bezel = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(W - 0.1, H - 0.1, R - 0.05), { depth: 0.006, bevelEnabled: false, curveSegments: 64 }), black);
  bezel.position.z = top - 0.001;
  phone.add(bezel);

  var tex = null;
  var screenMat = new THREE.MeshBasicMaterial({ color: 0x2f7be8 });
  if (opts.screen) {
    tex = new THREE.TextureLoader().load(opts.screen, function () { screenMat.needsUpdate = true; });
    tex.colorSpace = THREE.SRGBColorSpace;
    screenMat.map = tex; screenMat.color.set(0xffffff);
  }
  var screen = new THREE.Mesh(screenGeometry(W - 0.2, H - 0.2, R - 0.1), screenMat);
  screen.position.z = top + 0.006;
  phone.add(screen);

  var notch = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0.28, 0.075, 0.0375), 24), black);
  notch.position.set(0, H / 2 - 0.1 - 0.075, top + 0.0065);
  phone.add(notch);

  // two knurled dials in the left edge
  [0.42, -0.04].forEach(function (y) {
    var d = new THREE.Mesh(dial(), orange);
    d.position.set(-W / 2 - 0.012, y, 0);
    d.castShadow = true;
    phone.add(d);
  });

  // the ground, parallel to the phone, catching a soft shadow
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.position.z = -D / 2 - BEV - 0.18;
  ground.receiveShadow = true;
  phone.add(ground);

  var sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-2.5, 3.5, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 10;
  sun.shadow.bias = -0.0004;
  var sc = sun.shadow.camera; sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 1; sc.far = 14;
  phone.add(sun);

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
    renderer.render(scene, camera);
  })();

  return { setScreen: function (url) { screenMat.map = new THREE.TextureLoader().load(url); screenMat.map.colorSpace = THREE.SRGBColorSpace; screenMat.color.set(0xffffff); screenMat.needsUpdate = true; } };
}

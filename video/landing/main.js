/* Landing de Mancuernas.
   Normal:    scroll suave con Lenis; todo lo animado va atado al scroll.
   ?record    la página baja sola para filmarla. Espacio o clic para empezar, R para volver arriba.
   ?capture   el grabador (record.mjs) mueve la página cuadro por cuadro con window.__capture.seek(t). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search);
const REC = q.has('record'), CAPTURE = q.has('capture'), AUTO = REC || CAPTURE;
const REDUCED = !AUTO && matchMedia('(prefers-reduced-motion: reduce)').matches;
if (AUTO) document.documentElement.classList.add('rec');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ autoRefreshEvents: 'DOMContentLoaded,load' + (AUTO ? '' : ',resize,visibilitychange') });

const clamp01 = v => Math.min(1, Math.max(0, v));
const cubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- escena 3D ---------- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: CAPTURE });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
const key = new THREE.DirectionalLight(0xffc48a, 2.6); key.position.set(-5, 4, 5);
const rim = new THREE.DirectionalLight(0xa9bcff, 1.8); rim.position.set(6, 2, -4);
scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.12));

// Moleteado del agarre: rombos en relieve dibujados en un canvas
function knurl() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 4;
  for (let i = -256; i <= 512; i += 16) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke();
    g.beginPath(); g.moveTo(i + 256, 0); g.lineTo(i, 256); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 5);
  return t;
}
function softShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,.85)'); r.addColorStop(.55, 'rgba(0,0,0,.3)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Todas las piezas sólidas se desvanecen al pasar al plano; siguen escribiendo profundidad
// para que las líneas de atrás queden ocultas.
const solidMats = [];
const solid = o => { const m = new THREE.MeshPhysicalMaterial(Object.assign({ transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }, o)); solidMats.push(m); return m; };
const steel = solid({ color: 0xd9dce1, metalness: 1, roughness: 0.2 });
const gripMat = solid({ color: 0xc4c8ce, metalness: 1, roughness: 0.4, bumpMap: knurl(), bumpScale: 2.5 });
const rubber = c => solid({ color: c, roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.45 });
const lineMat = new THREE.LineBasicMaterial({ color: 0xeceef0, transparent: true, opacity: 0 });

const along = g => { g.rotateZ(-Math.PI / 2); return g; };   // eje de la mancuerna = X
const cyl = (r, len, seg = 64) => along(new THREE.CylinderGeometry(r, r, len, seg));
function plateGeo(R, T) {
  const h = T / 2, a = 0.3;
  const p = [[a, -h * .9], [.36, -h], [.42, -h], [.46, -h * .68], [R - .12, -h * .68], [R - .075, -h], [R - .02, -h], [R, -h * .78],
             [R, h * .78], [R - .02, h], [R - .075, h], [R - .12, h * .68], [.46, h * .68], [.42, h], [.36, h], [a, h * .9]];
  return along(new THREE.LatheGeometry(p.map(([x, y]) => new THREE.Vector2(x, y)), 96));
}

const dumb = new THREE.Group();
scene.add(dumb);
const parts = [];
function add(geo, mat, x, o = {}) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), lineMat));
  dumb.add(mesh);
  const p = Object.assign({ mesh, x, off: [0, 0, 0], rot: [0, 0, 0], delay: 0, seed: parts.length * 1.7 }, o);
  parts.push(p);
  return p;
}

// Medidas en unidades de escena (1 unidad ≈ 12,5 cm)
add(cyl(0.16, 1.4), gripMat, 0, { off: [0, .12, 0], rot: [0, 0, .1], tag: 'Equipo', anchor: [0, -.16, 0], below: true });
add(cyl(0.2, 0.74), steel, -1.07, { off: [0, .12, 0], rot: [0, 0, .1] });
add(cyl(0.2, 0.74), steel, 1.07, { off: [0, .12, 0], rot: [0, 0, .1] });
const PLATES = [
  { R: .95, T: .17, x: .88, c: 0xc81f26, kg: '5 KG' },
  { R: .80, T: .15, x: 1.045, c: 0x2a40c4, kg: '2,5 KG' },
  { R: .66, T: .13, x: 1.19, c: 0xe9b80a, kg: '1,25 KG' },
];
// Texto impreso alrededor de la cara del disco
function stamp(text, R) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'), r = 256 * ((R - .2) / R) * .93;
  g.translate(256, 256); g.fillStyle = 'rgba(236,238,240,.9)';
  g.font = `700 ${Math.round(46 * (.95 / R) ** .3)}px "Big Shoulders Display", Impact, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const label = `MANCUERNAS   ${text}   `.repeat(2).split('');
  const step = (Math.PI * 2) / label.length;
  label.forEach((ch, i) => { g.save(); g.rotate(i * step); g.translate(0, -r); g.fillText(ch, 0, 0); g.restore(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const decalGeo = new Map();
const TAGS = { '-1': ['Objetivo', 'Nivel', 'Días'], '1': ['Tiempo', 'Zona', 'Molestias'] };
for (const s of [-1, 1]) {
  add(cyl(0.31, 0.09), steel, s * .745, { off: [s * .45, .5, .3], rot: [.2, s * .7, 0], delay: 0 });
  PLATES.forEach((pl, i) => {
    const offs = [[s * .9, -.42, .55], [s * 1.35, .62, -.25], [s * 1.8, -.18, .4]][i];
    const rots = [[0, s * 1.0, .15], [.3, s * .8, -.12], [-.2, s * 1.1, .2]][i];
    const plate = add(plateGeo(pl.R, pl.T), rubber(pl.c), s * pl.x, {
      off: offs, rot: rots, delay: .12 + i * .12,
      tag: TAGS[s][i], anchor: s < 0 ? [0, pl.R, 0] : [0, -pl.R, 0], below: s > 0,
    });
    const dm = solid({ map: stamp(pl.kg, pl.R), roughness: .6, depthWrite: false, polygonOffset: false });
    dm.userData.stamp = [pl.kg, pl.R];
    for (const face of [-1, 1]) {
      const d = new THREE.Mesh(new THREE.RingGeometry(.47, pl.R - .13, 96), dm);
      // la cara de la geometría plana mira a +Z; se gira para que mire a ±X
      d.rotation.y = face * Math.PI / 2;
      if (face > 0) d.rotation.z = Math.PI;
      d.position.x = face * (pl.T / 2 * .68 + .003);
      plate.mesh.add(d);
    }
    // buje metálico en el centro del disco
    add(cyl(0.3, pl.T * .92), steel, s * pl.x, { off: offs, rot: rots, delay: .12 + i * .12 });
  });
  add(cyl(0.29, 0.12), steel, s * 1.32, { off: [s * 2.2, .42, .1], rot: [.4, s * .5, .3], delay: .5 });
}

// Para el plano: siluetas del agarre y los manguitos, y el moleteado como hélices cruzadas.
// Las del lado de atrás las tapa la profundidad de las piezas sólidas.
{
  const pts = [], seg = 48;
  const sil = (x0, x1, r) => { for (const y of [-r, r]) pts.push(x0, y, 0, x1, y, 0); };
  sil(-.7, .7, .1605); sil(-1.44, -.7, .2005); sil(.7, 1.44, .2005);
  const r = .1612, turns = 1.6;
  for (const dir of [-1, 1]) for (let j = 0; j < 22; j++) {
    const a0 = j / 22 * Math.PI * 2;
    for (let k = 0; k < seg; k++) {
      const u0 = k / seg, u1 = (k + 1) / seg;
      const f = u => { const x = -.62 + u * 1.24, a = a0 + dir * u * turns * Math.PI * 2; return [x, r * Math.cos(a), r * Math.sin(a)]; };
      pts.push(...f(u0), ...f(u1));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  parts[0].mesh.add(new THREE.LineSegments(g, lineMat));
}

const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: softShadow(), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
scene.add(shadow);

/* ---------- estado que mueve el scroll ---------- */
const st = { A: 0, rotY: -.62, tiltX: .26, px: .95, py: .62, scale: .74, camY: 1.1, wire: 0, tags: 0, dims: 0, glow: 1 };

/* ---------- capa de etiquetas y cotas ---------- */
const svg = $('.overlay'), NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
const tagParts = parts.filter(p => p.tag);
for (const p of tagParts) {
  p.tagEl = document.createElement('span'); p.tagEl.className = 'tag'; p.tagEl.textContent = p.tag;
  $('.tags').appendChild(p.tagEl);
  p.lead = el('line');
}
// Cotas del plano (coordenadas locales de la mancuerna)
const DIMS = [
  { a: [-1.44, -1.12], b: [1.44, -1.12], text: 'Largo total 36 cm', place: 'below', ext: [-0.2, -1.2] },
  { a: [-.7, -.5], b: [.7, -.5], text: 'Agarre 17,5 cm', place: 'below', ext: [-.18, -.58] },
  { a: [1.62, -.95], b: [1.62, .95], text: 'Disco Ø 24 cm', place: 'right', ext: [1.48, 1.7] },
];
const dimG = el('g', { class: 'dim' });
for (const d of DIMS) {
  d.line = el('line', {}, dimG); d.t1 = el('path', {}, dimG); d.t2 = el('path', {}, dimG);
  d.e1 = el('line', {}, dimG); d.e2 = el('line', {}, dimG);
  d.label = el('text', {}, dimG); d.label.textContent = d.text;
}
const axis = el('line', { 'stroke-dasharray': '18 6 3 6' });
const call = { line: el('path'), label: el('text') };
call.label.textContent = 'Tolerancia a excusas ± 0,00 mm';

let W = 1, H = 1, camZ = 10.5;
const v3 = new THREE.Vector3();
function scr(obj, x, y, z = 0) { v3.set(x, y, z); obj.localToWorld(v3); v3.project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; }
const P = pts => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function drawOverlay() {
  // etiquetas de las piezas sueltas
  for (const p of tagParts) {
    const o = st.tags * (1 - clamp01((p.k - .55) / .35)) * (1 - st.wire);
    p.tagEl.style.opacity = o; p.lead.style.opacity = o;
    if (o <= 0) continue;
    const [x, y] = scr(p.mesh, ...p.anchor), dy = p.below ? 34 : -34;
    p.lead.setAttribute('x1', x); p.lead.setAttribute('y1', y); p.lead.setAttribute('x2', x); p.lead.setAttribute('y2', y + dy);
    p.tagEl.style.transform = `translate(${x}px,${y + dy}px) translate(-50%,${p.below ? '0' : '-100%'})`;
  }
  // cotas
  const k = st.dims;
  dimG.style.opacity = k > 0 ? 1 : 0; axis.style.opacity = call.line.style.opacity = call.label.style.opacity = clamp01(k * 1.5);
  if (k <= 0) return;
  for (const d of DIMS) {
    const vert = d.place === 'right';
    const A = scr(dumb, ...d.a), B = scr(dumb, ...d.b), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const a = [lerp(M[0], A[0], k), lerp(M[1], A[1], k)], b = [lerp(M[0], B[0], k), lerp(M[1], B[1], k)];
    d.line.setAttribute('x1', a[0]); d.line.setAttribute('y1', a[1]); d.line.setAttribute('x2', b[0]); d.line.setAttribute('y2', b[1]);
    const tick = ([x, y]) => `M${x - 6},${y + 6}L${x + 6},${y - 6}`;
    d.t1.setAttribute('d', tick(a)); d.t2.setAttribute('d', tick(b));
    // líneas de extensión hacia la pieza
    const [e0, e1] = d.ext;
    const E = vert ? [scr(dumb, e0, d.a[1]), scr(dumb, e1, d.a[1]), scr(dumb, e0, d.b[1]), scr(dumb, e1, d.b[1])]
                   : [scr(dumb, d.a[0], e0), scr(dumb, d.a[0], e1), scr(dumb, d.b[0], e0), scr(dumb, d.b[0], e1)];
    d.e1.setAttribute('x1', E[0][0]); d.e1.setAttribute('y1', E[0][1]); d.e1.setAttribute('x2', E[1][0]); d.e1.setAttribute('y2', E[1][1]);
    d.e2.setAttribute('x1', E[2][0]); d.e2.setAttribute('y1', E[2][1]); d.e2.setAttribute('x2', E[3][0]); d.e2.setAttribute('y2', E[3][1]);
    d.e1.style.opacity = d.e2.style.opacity = k;
    const lx = vert ? M[0] + 16 : M[0], ly = d.place === 'below' ? M[1] + 28 : d.place === 'above' ? M[1] - 14 : M[1] + 5;
    d.label.setAttribute('x', lx); d.label.setAttribute('y', ly);
    d.label.setAttribute('text-anchor', vert ? 'start' : 'middle');
    d.label.style.opacity = clamp01((k - .5) * 2);
  }
  const L = scr(dumb, -1.75, 0), R = scr(dumb, 1.75, 0);
  axis.setAttribute('x1', L[0]); axis.setAttribute('y1', L[1]); axis.setAttribute('x2', lerp(L[0], R[0], k)); axis.setAttribute('y2', R[1]);
  const c0 = scr(dumb, -.25, .16), c1 = scr(dumb, -.72, 1.28);
  call.line.setAttribute('d', `M${P([c0, c1, [c1[0] - 260, c1[1]]])}`.replace(/ /g, 'L'));
  call.label.setAttribute('x', c1[0] - 260); call.label.setAttribute('y', c1[1] - 10);
}

/* ---------- render ---------- */
const sticky1 = $('.s-ensamble .sticky');
function render(t) {
  for (const p of parts) {
    const k = cubic(clamp01((st.A - p.delay) / .45)), e = 1 - k;
    const bob = REDUCED ? 0 : Math.sin(t * .9 + p.seed) * .05 * e;
    p.mesh.position.set(p.x + p.off[0] * e, p.off[1] * e + bob, p.off[2] * e);
    p.mesh.rotation.set(p.rot[0] * e, p.rot[1] * e, p.rot[2] * e);
    p.k = k;
  }
  const sway = REDUCED ? 0 : Math.sin(t * .45) * .08 * (1 - st.wire);
  dumb.rotation.set(st.tiltX, st.rotY + sway, 0);
  dumb.position.set(st.px, st.py, 0);
  dumb.scale.setScalar(st.scale);
  for (const m of solidMats) m.opacity = 1 - st.wire;
  lineMat.opacity = st.wire;
  shadow.material.opacity = .55 * (1 - st.wire) * (.55 + .45 * st.A);
  shadow.position.set(st.px, st.py - 1.3 * st.scale, 0);
  shadow.scale.set(lerp(6.5, 4.2, st.A) * st.scale, lerp(2.6, 1.5, st.A) * st.scale, 1);
  camera.position.set(0, st.camY, camZ);
  camera.lookAt(0, 0, 0);
  sticky1.style.setProperty('--glow', st.glow);
  renderer.render(scene, camera);
  drawOverlay();
}

function resize() {
  W = canvas.clientWidth; H = canvas.clientHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camZ = 10.5 * Math.max(1, 1.55 / camera.aspect);
  camera.updateProjectionMatrix();
}
resize();

/* ---------- animaciones atadas al scroll ---------- */
const vh = () => window.innerHeight, vw = () => window.innerWidth;

// 1. ensamble y plano
gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.s-ensamble', start: 'top top', end: 'bottom bottom', scrub: true } })
  .to('.copy-a', { opacity: 0, y: -50, duration: .8 }, 1)
  .to('.aside', { opacity: 0, y: -30, duration: .8 }, 1)
  .to(st, { tags: 1, duration: .6 }, 1.3)
  .fromTo('.copy-b', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .8 }, 1.5)
  .to(st, { A: 1, duration: 3.6 }, 1.9)
  .to(st, { rotY: -.3, tiltX: .16, px: 0, py: .6, scale: .92, camY: .7, duration: 3.6, ease: 'sine.inOut' }, 1.9)
  .to('.copy-b', { opacity: 0, y: -50, duration: .7 }, 5.5)
  .to(st, { rotY: 0, tiltX: 0, py: .62, scale: .95, camY: .35, duration: 1.8, ease: 'power2.inOut' }, 5.6)
  .to(st, { wire: 1, glow: 0, duration: 1.2 }, 6)
  .to(sticky1, { backgroundColor: '#2f48d4', duration: 1.2 }, 6)
  .to('.bp-grid', { opacity: 1, duration: 1.2 }, 6.2)
  .to(st, { dims: 1, duration: 1.3 }, 7.2)
  .fromTo('.copy-c', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .8 }, 7.4)
  .to({}, { duration: 1 }, 9);

// 2. teléfonos que suben uno tras otro
gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: '.s-app', start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } })
  .fromTo('.s-app h2', { y: () => vh() * .3 }, { y: 0, duration: 1 }, 0)
  .fromTo('.phone', { y: () => vh() * .95, rotation: 7 }, { y: 0, rotation: 0, duration: 1.1, stagger: .35 }, .1)
  .fromTo('.phones', { x: 0 }, { x: () => -vw() * .03, duration: 1, ease: 'none' }, 1.4);

// 3. coach: frases en sentidos opuestos y forma de onda
const wave = $('.wave');
for (let i = 0; i < 84; i++) wave.appendChild(document.createElement('b'));
const bars = [...wave.children];
gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.s-coach', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true,
  onUpdate: s => {
    const p = s.progress;
    bars.forEach((b, i) => {
      const env = Math.sin(Math.PI * clamp01((i / bars.length) * 1.1 - .05));
      const v = Math.abs(Math.sin(i * .37 + p * 21) * Math.sin(i * .13 - p * 9.5)) * env;
      b.style.height = (12 + v * 88).toFixed(1) + '%';
    });
  } } })
  .fromTo('.m1', { x: () => vw() * .25 }, { x: () => -($('.m1').scrollWidth - vw()) * .6 }, 0)
  .fromTo('.m2', { x: () => -($('.m2').scrollWidth - vw()) * .7 }, { x: () => vw() * .05 }, 0);

// 4. comida: el menú entra por la derecha
gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: '.s-comida', start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } })
  .fromTo('.comida-head', { y: () => vh() * .25 }, { y: 0, duration: 1 }, 0)
  .fromTo('.menu div', { x: () => vw() * .5, opacity: 0 }, { x: 0, opacity: 1, duration: .9, stagger: .28 }, .6);

// 5. constancia: la palabra atraviesa la pantalla y la barra de niveles se llena
const lis = $$('.levels li');
gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.s-constancia', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
  .fromTo('.giant', { x: () => vw() * .45 }, { x: () => -($('.giant').scrollWidth - vw() * .7) });
gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.s-constancia', start: 'top 40%', end: 'bottom bottom', scrub: true,
  onUpdate: s => lis.forEach((li, i) => li.classList.toggle('on', s.progress * 6 > i + .15)) } })
  .fromTo('.rail span', { scaleX: 0 }, { scaleX: 1 });

// 6. opiniones
gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: '.s-resenas', start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } })
  .fromTo('.s-resenas h2', { y: () => vh() * .2 }, { y: 0, duration: 1 }, 0)
  .fromTo('.quotes li', { y: () => vh() * .6, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .3 }, .3);

// 7. el nombre sube letra por letra
const wm = $('.wordmark');
wm.innerHTML = [...wm.textContent].map(c => `<span>${c}</span>`).join('');
gsap.timeline({ scrollTrigger: { trigger: '.s-final', start: 'top bottom', end: 'bottom bottom', scrub: true } })
  .fromTo('.wordmark span', { yPercent: 110 }, { yPercent: 0, ease: 'power3.out', duration: 1, stagger: .06 })
  .fromTo('.final-row', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6 }, .5);

// El menú cambia a oscuro sobre las secciones claras
const nav = $('.nav');
for (const sec of $$('main > section')) {
  const dark = sec.matches('.s-app, .s-coach, .s-constancia');
  ScrollTrigger.create({ trigger: sec, start: 'top 40px', end: 'bottom 40px', onToggle: s => { if (s.isActive) nav.classList.toggle('dark', dark); } });
}

/* ---------- recorrido automático para grabar ---------- */
// [segundo, sección, fracción del recorrido dentro de la sección].
// Dos claves seguidas con la misma posición son una pausa.
const KEYS = [
  [0, '.s-ensamble', 0], [0.8, '.s-ensamble', 0],
  [2.0, '.s-ensamble', .2],      // cambia el texto y aparecen las etiquetas
  [4.9, '.s-ensamble', .56],     // mancuerna armada
  [6.4, '.s-ensamble', .86],     // plano con cotas
  [6.9, '.s-ensamble', 1], [7.3, '.s-ensamble', 1],
  [8.1, '.s-app', 0], [9.7, '.s-app', 1],
  [10.4, '.s-coach', 0], [12.0, '.s-coach', 1],
  [12.7, '.s-comida', 0], [13.9, '.s-comida', 1],
  [14.6, '.s-constancia', 0], [15.8, '.s-constancia', 1],
  [16.5, '.s-resenas', 0], [17.6, '.s-resenas', 1],
  [18.4, '.s-final', 0], [19.6, '.s-final', 0],
];
const DURATION = KEYS[KEYS.length - 1][0];
const KT = KEYS.map(k => k[0]);
let keyY = [], tan = [];
function measureKeys() {
  const max = document.documentElement.scrollHeight - vh();
  keyY = KEYS.map(([, sel, f]) => { const s = $(sel); return Math.min(max, s.offsetTop + f * Math.max(0, s.offsetHeight - vh())); });
  // tangentes monótonas (Fritsch–Carlson): velocidad continua, sin pasarse ni devolverse
  const n = keyY.length, d = [];
  for (let i = 0; i < n - 1; i++) d.push((keyY[i + 1] - keyY[i]) / (KT[i + 1] - KT[i]));
  tan = keyY.map((_, i) => i === 0 ? 0 : i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { tan[i] = tan[i + 1] = 0; continue; }
    const a = tan[i] / d[i], b = tan[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); tan[i] = k * a * d[i]; tan[i + 1] = k * b * d[i]; }
  }
}
function scrollAt(t) {
  if (t <= 0) return keyY[0];
  for (let i = 1; i < KT.length; i++) {
    if (t > KT[i]) continue;
    const h = KT[i] - KT[i - 1], u = (t - KT[i - 1]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keyY[i - 1] + (u3 - 2 * u2 + u) * h * tan[i - 1] + (-2 * u3 + 3 * u2) * keyY[i] + (u3 - u2) * h * tan[i];
  }
  return keyY[keyY.length - 1];
}
function seek(t) {
  window.scrollTo(0, scrollAt(t));
  ScrollTrigger.update();
  render(t);
}

/* ---------- arranque ---------- */
const imgsReady = Promise.all($$('img').map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
const ready = Promise.all([document.fonts.ready, imgsReady]).then(() => {
  // los textos de los discos se redibujan con la fuente ya cargada
  for (const m of solidMats) if (m.userData.stamp) { m.map.dispose(); m.map = stamp(...m.userData.stamp); m.needsUpdate = true; }
  resize(); ScrollTrigger.refresh(); measureKeys(); render(0);
});

addEventListener('resize', () => { resize(); if (keyY.length) measureKeys(); });

if (CAPTURE) {
  window.__capture = { ready, duration: DURATION, seek };
} else if (REC) {
  let start = null;
  const go = () => { start = performance.now(); window.__recordDone = false; };
  addEventListener('click', go);
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); go(); }
    if (e.key === 'r' || e.key === 'R') { start = null; seek(0); }
  });
  gsap.ticker.add(time => {
    if (start === null) { render(time); return; }
    const t = (performance.now() - start) / 1000;
    seek(Math.min(t, DURATION));
    if (t >= DURATION) window.__recordDone = true;
  });
} else {
  if (!REDUCED && window.Lenis) {
    const lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  gsap.ticker.add(time => render(time));
}

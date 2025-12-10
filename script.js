import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js";

import { Horse } from "./horse.js";
import { Bunny } from "./bunny.js";

let camera, scene, renderer, effect, controls;
const keys = {};
const objLoader = new OBJLoader();
const loader = new THREE.TextureLoader();

const INTERACTIVES = [];

let asciiEnabled = true;
let darkMode = true;

let horses = [];
let bunnies = [];
const trees = [
  "MapleTree_1",
  "MapleTree_5",
  "MapleTree_2",
  "NormalTree_1",
  "NormalTree_2",
  "PineTree_1",
  "PineTree_2",
  "NormalTree_4",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 15);

  // light
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(10, 20, 10);
  scene.add(light);
  const ambient = new THREE.AmbientLight(0x333333);
  scene.add(ambient);

  // Grass - Plant a seed / star
  makeGrass(45, 0, -33);
  makeGrass(40, 0, -30);
  makeGrass(49, 0, -26);

  objLoader.load("OBJ/Flower_1_Clump.obj", (model) => {
    model.scale.setScalar(randomInt(6, 8));
    model.position.set(44, 0, -27);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);
    INTERACTIVES.push({
      object: model,
      element: document.getElementById("plant-a-star-seed"),
      proximity: 30,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(0, 6, 0),
    });
  });

  // Moon
  const moon = new THREE.Object3D();
  moon.position.set(-20, 10, 0);
  INTERACTIVES.push({
    object: moon,
    element: document.getElementById("moon"),
    proximity: 20,
    anchor: new THREE.Vector3(0, 0, 0),
  });

  // Flowers - dark mode
  objLoader.load("OBJ/Flower_1_Clump.obj", (model) => {
    model.scale.setScalar(randomInt(6, 8));
    model.position.set(16, 0, 50);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);

    INTERACTIVES.push({
      object: model,
      element: document.getElementById("dark-mode"),
      proximity: 30,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(0, 5, 0),
    });
  });
  objLoader.load("OBJ/Flower_2_Clump.obj", (model) => {
    model.scale.setScalar(randomInt(2, 6));
    model.position.set(18, 0, 48);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);

    INTERACTIVES.push({
      object: model,
      element: document.getElementById("dark-mode-2"),
      proximity: 30,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(0, 4, 0),
    });
  });
  objLoader.load("OBJ/Flower_3_Clump.obj", (model) => {
    model.scale.setScalar(randomInt(4, 6));
    model.position.set(10, 0, 54);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);

    INTERACTIVES.push({
      object: model,
      element: document.getElementById("dark-mode-3"),
      proximity: 30,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(0, 3, 0),
    });
  });

  // Standing horses
  const horse = new Horse({
    scene,
    camera,
    sprite: "sprites/horsey-chillen.png",
    frameCount: 7,
    animSpeed: 0.2,
    speed: 0,
    startX: -60,
    y: 5,
    z: 100,
    resetX: 0,
    dir: new THREE.Vector3(0, 0, 0),
  });
  const horse2 = new Horse({
    scene,
    camera,
    sprite: "sprites/horsey-chillen.png",
    frameCount: 7,
    animSpeed: 0.2,
    speed: 0,
    startX: -80,
    y: 5,
    z: 120,
    resetX: 0,
    dir: new THREE.Vector3(1, 1, 1),
  });
  INTERACTIVES.push({
    object: horse.mesh,
    element: document.getElementById("dancing-horses"),
    proximity: 20,
    anchor: new THREE.Vector3(0, 0, 0),
    offset: new THREE.Vector3(0, 3, 0),
  });
  const horse3 = new Horse({
    scene,
    camera,
    sprite: "sprites/horsey-chillen.png",
    frameCount: 7,
    animSpeed: 0.2,
    speed: 0,
    startX: -70,
    y: 5,
    z: 130,
    resetX: 0,
    dir: new THREE.Vector3(0, 0, 0),
  });
  horses.push(horse, horse2, horse3);

  for (let i = 0; i < 10; i++) {
    const z = randomInt(90, 130);
    const x = randomInt(-90, -50);
    makeGrass(x, 0, z);
  }

  // Starting tree
  makeTree(0, 0, -50, (tree) => {
    INTERACTIVES.push({
      object: tree,
      element: document.getElementById("plant-a-tree"),
      proximity: 20,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(-4, 4, 0),
    });
  });
  makeGrass(0, 0, -50);
  makeGrass(4, 0, -47);

  // Forest
  const forestXmin = 100;
  const forestXmax = 180;
  const forestZmin = 20;
  const forestZmax = 100;
  for (let i = 0; i < 10; i++) {
    const z = randomInt(forestZmin, forestZmax);
    const x = randomInt(forestXmin, forestXmax);
    makeTree(x, 0, z);
  }
  for (let i = 0; i < 10; i++) {
    const z = randomInt(forestZmin, forestZmax);
    const x = randomInt(forestXmin, forestXmax);
    makeGrass(x, 0, z);
  }

  // Bunnies
  for (let i = 0; i < 10; i++) {
    const z = randomInt(forestZmin, forestZmax);
    const x = randomInt(forestXmin, forestXmax);
    const destZ = randomInt(-200, 200);
    const destX = randomInt(200, 300);
    const bunny = new Bunny({
      scene,
      camera,
      frameCount: 4,
      animSpeed: 0.08,
      startX: x,
      startY: 0,
      startZ: z,
      dest: new THREE.Vector3(destX, 0, destZ),
      runSpeed: 0.08,
    });
    bunnies.push(bunny);

    const bunnyText = document.getElementById("run-rabbit").cloneNode(true);
    bunnyText.bunny = bunny;
    document.body.appendChild(bunnyText);
    INTERACTIVES.push({
      object: bunny.mesh,
      element: bunnyText,
      proximity: 20,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(0, 3, 0),
    });
  }

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = "none";
  document.body.appendChild(renderer.domElement);

  // --- ASCII Effect ---
  effect = new AsciiEffect(renderer, " `.:-=*#%@", { invert: true });
  effect.setSize(window.innerWidth, window.innerHeight);
  effect.domElement.style.backgroundColor = "black";
  effect.domElement.style.color = "white";
  effect.domElement.style.fontFamily = '"Courier New", monospace';
  effect.domElement.style.pointerEvents = "none";
  document.body.appendChild(effect.domElement);

  // --- Controls ---
  controls = new PointerLockControls(camera, document.body);
  // document.body.addEventListener("click", () => controls.lock());

  document.addEventListener("keydown", (e) => (keys[e.key] = true));
  document.addEventListener("keyup", (e) => (keys[e.key] = false));

  // Toggle ASCII on/off
  window.addEventListener("keydown", (e) => {
    if (e.key === "a") asciiEnabled = !asciiEnabled;
  });

  window.addEventListener("resize", onWindowResize);
}

// --- Add new objects to scene ---

function makeGrass(x, y, z) {
  objLoader.load("OBJ/Grass_Small.obj", (model) => {
    model.scale.setScalar(randomInt(8, 12));
    model.position.set(x, y, z);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);
  });
}

function makeTree(x, y, z, onLoad) {
  const tree = trees[Math.floor(Math.random() * trees.length)];
  objLoader.load(`OBJ/${tree}.obj`, (model) => {
    model.scale.setScalar(3);
    model.position.set(x, y, z);
    model.rotation.y = Math.random() * Math.PI * 2;
    scene.add(model);

    if (onLoad) {
      onLoad(model);
    }
  });
}

function makeNewTree() {
  const z = randomInt(0, -100);
  const x = randomInt(-50, 50);
  makeGrass(x, 0, z);
  makeTree(x, 0, z, (tree) => {
    INTERACTIVES.push({
      object: tree,
      element: document.getElementById("plant-a-tree"),
      proximity: 20,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(-4, 4, 0),
    });
  });
}

function makeStars() {
  const count = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    const x = (Math.random() - 0.5) * 500;
    const y = Math.random() * 200 + 100;
    const z = (Math.random() - 0.5) * 500;
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

function makeSeeds() {
  const count = 20;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    const x = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;
    positions[i] = x;
    positions[i + 1] = -10;
    positions[i + 2] = z;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 4,
    sizeAttenuation: false,
  });
  const seeds = new THREE.Points(geometry, material);
  scene.add(seeds);
  return seeds;
}

function changeColor() {
  if (darkMode) {
    effect.domElement.style.backgroundColor = "white";
    effect.domElement.style.color = "black";
    const textElements = document.querySelectorAll(".text");
    textElements.forEach((el) => {
      el.style.color = "black";
      const links = el.querySelectorAll("a");
      links.forEach((a) => {
        a.style.color = "black";
      });
    });
  } else {
    effect.domElement.style.backgroundColor = "black";
    effect.domElement.style.color = "white";
    const textElements = document.querySelectorAll(".text");
    textElements.forEach((el) => {
      el.style.color = "white";
      const links = el.querySelectorAll("a");
      links.forEach((a) => {
        a.style.color = "white";
      });
    });
  }
  darkMode = !darkMode;
}

function makeMoon() {
  loader.load("landscape/moon.jpg", (texture) => {
    const moonRadius = 12;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1.0,
      metalness: 0.0,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-50, 60, -50);
    scene.add(moon);
  });
  // rm the button from scene
  const moonText = document.getElementById("moon");
  if (moonText) moonText.remove();
}

function initHorse(position) {
  const horse = new Horse({
    scene,
    camera,
    sprite: "sprites/horsey-run.png",
    frameCount: 5,
    animSpeed: 0.08,
    speed: 0.1,
    startX: position[0],
    y: position[1],
    z: position[2],
    resetX: -position[0],
    dir: new THREE.Vector3(1, 0, 0),
  });
  horses.push(horse);
}

function bringOnTheDancingHorses() {
  initHorse([-120, 5, 60]);
  initHorse([-141, 5, 60]);
  initHorse([-120, 5, 70]);
  initHorse([-135, 5, 55]);
  initHorse([-110, 5, 55]);
  initHorse([-130, 5, 650]);

  const horseText = document.getElementById("dancing-horses");
  if (horseText) horseText.remove();
}

function runRabbitRun(clicked) {
  const wrapper = clicked.closest("#run-rabbit");
  if (!wrapper || !wrapper.bunny) return;
  const bunny = wrapper.bunny;
  bunny.run();
  wrapper.style.opacity = 0;
}

// Expose to global scope so onclick handlers can call it
window.makeNewTree = makeNewTree;
window.makeStars = makeStars;
window.makeSeeds = makeSeeds;
window.makeMoon = makeMoon;
window.changeColor = changeColor;
window.bringOnTheDancingHorses = bringOnTheDancingHorses;
window.runRabbitRun = runRabbitRun;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
}

function updateMovement() {
  const speed = 0.2;
  if (keys["ArrowUp"]) controls.moveForward(speed);
  if (keys["ArrowDown"]) controls.moveForward(-speed);
  if (keys["ArrowLeft"]) controls.getObject().rotation.y += 0.03;
  if (keys["ArrowRight"]) controls.getObject().rotation.y -= 0.03;
}

// update interactives (hypertexts)
function updateInteractions() {
  INTERACTIVES.forEach((item) => {
    const dist = camera.position.distanceTo(item.object.position);

    if (dist < item.proximity) {
      const object = item.object;
      const element = item.element;
      if (!element || !object) return;

      const anchor = item.anchor || new THREE.Vector3(0, 0, 0);
      const offset = item.offset || new THREE.Vector3(0, 0, 0);

      // compute world position of the anchor (anchor is local to object)
      const worldAnchor = object.localToWorld(anchor.clone());

      // add world-space offset
      const worldPos = worldAnchor.add(offset);

      // project to screen
      const projected = worldPos.clone().project(camera);

      // Hide if behind camera (z > 1 in NDC) or off-screen
      if (
        projected.z > 1 ||
        projected.x < -1 ||
        projected.x > 1 ||
        projected.y < -1 ||
        projected.y > 1
      ) {
        element.style.display = "none";
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

      // place the element centered at the computed screen coords
      element.style.display = "block";
      element.style.left = x + "px";
      element.style.top = y + "px";
      element.style.transform = "translate(-50%, -50%)";
    } else {
      if (item.element) {
        item.element.style.display = "none";
      }
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  for (let i = 0; i < horses.length; i++) {
    horses[i].update();
  }

  for (let i = 0; i < bunnies.length; i++) {
    bunnies[i].update();
  }

  updateMovement();
  updateInteractions();

  if (asciiEnabled) {
    effect.render(scene, camera);
    effect.domElement.style.display = "block";
    renderer.domElement.style.display = "none";
  } else {
    renderer.render(scene, camera);
    effect.domElement.style.display = "none";
    renderer.domElement.style.display = "block";
  }
}

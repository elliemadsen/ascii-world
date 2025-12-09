import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js";

import { Horse } from "./horse.js";

let camera, scene, renderer, effect, controls;
const keys = {};
const objLoader = new OBJLoader();
const loader = new THREE.TextureLoader();

let asciiEnabled = true;
let darkMode = true;

let horses = [];

const trees = [
  "../models/landscape/79-low-poly-tree/Low Poly Tree.obj",
  "../models/landscape/TreeSketch_Tree1/Tree test.obj",
  "../models/landscape/10445_Oak_Tree_v1/10445_Oak_Tree_v1_max2010_iteration-1.obj",
];

// To add a new interactive object:
// 1. Create a 3D object (mesh or group)
// 2. Create a DOM element (info box)
// 3. Push a new entry into INTERACTIVES
const INTERACTIVES = [];

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
  camera.position.set(0, 8, 15);

  // light
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(10, 20, 10);
  scene.add(light);
  const ambient = new THREE.AmbientLight(0x333333);
  scene.add(ambient);

  //  Terrain
  // const terrainSize = 400;
  // loader.load("landscape/terrain.png", (texture) => {
  //   const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize);
  //   const terrainMat = new THREE.MeshStandardMaterial({
  //     map: texture,
  //     roughness: 1,
  //     metalness: 0.0,
  //   });
  //   const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  //   terrain.rotation.x = -Math.PI / 2; // rotate to lie flat
  //   scene.add(terrain);
  // });

  // Plant a seed / star
  const seedstar = new THREE.Object3D();
  seedstar.position.set(40, 8, -10);
  INTERACTIVES.push({
    object: seedstar,
    element: document.getElementById("plant-a-star-seed"),
    proximity: 30,
    anchor: new THREE.Vector3(0, 0, 0),
  });

  // Moon
  const moon = new THREE.Object3D();
  moon.position.set(-20, 12, 0);
  INTERACTIVES.push({
    object: moon,
    element: document.getElementById("moon"),
    proximity: 20,
    anchor: new THREE.Vector3(0, 0, 0),
  });

  // dark mode
  const dark_mode = new THREE.Object3D();
  dark_mode.position.set(20, 0, 40);
  INTERACTIVES.push({
    object: dark_mode,
    element: document.getElementById("dark-mode"),
    proximity: 30,
    anchor: new THREE.Vector3(0, 2, 0),
  });

  // horses
  const horses_text = new THREE.Object3D();
  horses_text.position.set(-40, 8, 40);
  INTERACTIVES.push({
    object: horses_text,
    element: document.getElementById("dancing-horses"),
    proximity: 30,
    anchor: new THREE.Vector3(0, 0, 0),
  });

  // Trees
  objLoader.load(
    "models/landscape/79-low-poly-tree/Low Poly Tree.obj",
    (tree) => {
      tree.scale.setScalar(1);
      tree.position.set(0, 0, 30);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);

      const treeTextClone = document
        .getElementById("plant-a-tree")
        .cloneNode(true);
      treeTextClone.id = "plant-a-tree-1"; // make it unique
      document.body.appendChild(treeTextClone);
      INTERACTIVES.push({
        object: tree,
        element: treeTextClone,
        proximity: 20,
        anchor: new THREE.Vector3(0, 0, 0),
        offset: new THREE.Vector3(-4, 4, 0),
      });
    }
  );

  objLoader.load("models/landscape/TreeSketch_Tree1/Tree test.obj", (tree) => {
    tree.position.set(0, 0, -30);
    tree.scale.setScalar(1);
    tree.rotation.x = -Math.PI / 2;
    scene.add(tree);
    INTERACTIVES.push({
      object: tree,
      element: document.getElementById("plant-a-tree"),
      proximity: 20,
      anchor: new THREE.Vector3(0, 0, 0),
      offset: new THREE.Vector3(-4, 4, 0),
    });
  });

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = "none";
  document.body.appendChild(renderer.domElement);

  // --- ASCII Effect ---
  effect = new AsciiEffect(renderer, " .:-=+*#%@", { invert: true });
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

// --- Add new Interactable objects to scene ---

function makeNewTree() {
  const tree_path = trees[Math.floor(Math.random() * trees.length)];
  objLoader.load(tree_path, (tree) => {
    const x = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    tree.position.set(x, 0, z);
    if (tree_path.includes("Tree test")) {
      tree.scale.setScalar(1);
      tree.rotation.x = -Math.PI / 2;
    } else if (tree_path.includes("10445_Oak_Tree")) {
      tree.scale.setScalar(0.03);
      tree.rotation.x = -Math.PI / 2;
    } else if (tree_path.includes("Low Poly Tree")) {
      tree.scale.setScalar(1);
      tree.rotation.y = Math.random() * Math.PI * 2;
    }
    scene.add(tree);
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
  console.log("make stars");
  const count = 800;
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
    size: 0.8,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return stars;
}

function makeSeeds() {
  console.log("make seeds");

  const count = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    const x = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;

    positions[i] = x;
    positions[i + 1] = -5;
    positions[i + 2] = z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 4,
    sizeAttenuation: false, // keeps them flat + fixed-size on screen
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

  const text = document.getElementById("dark-mode");

  // Move up by 5px
  text.style.top = parseInt(getComputedStyle(text).top) - 5 + "px";

  // Move right by 5px
  text.style.left = parseInt(getComputedStyle(text).left) + 5 + "px";
}

function makeMoon() {
  document.getElementById("moon").style.display = "none";

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
  const index = INTERACTIVES.findIndex((item) => item.element.id === "moon");
  if (index !== -1) {
    const moonEntry = INTERACTIVES[index];
    scene.remove(moonEntry.object);
    INTERACTIVES.splice(index, 1);
  }
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
    resetX: -150,
    dir: new THREE.Vector3(-1, 0, 0),
  });
  horses.push(horse);
}

function bringOnTheDancingHorses() {
  initHorse([100, 5, -40]);
  initHorse([101, 5, -30]);
  initHorse([80, 5, -20]);
  initHorse([85, 5, -35]);
  initHorse([70, 5, -55]);
  initHorse([120, 5, -20]);
}

// Expose to global scope so onclick handlers can call it
window.makeNewTree = makeNewTree;
window.makeStars = makeStars;
window.makeSeeds = makeSeeds;
window.makeMoon = makeMoon;
window.changeColor = changeColor;
window.bringOnTheDancingHorses = bringOnTheDancingHorses;

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

// UNIVERSAL INTERACTION UPDATE LOOP
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

// Bunny.js

// Sprites are from https://givty.itch.io/bunny-pack

import * as THREE from "three";

export class Bunny {
  constructor(options) {
    this.scene = options.scene;
    this.camera = options.camera;

    // animation + movement
    this.frameCount = options.frameCount || 4;
    this.animSpeed = options.animSpeed || 0.1;
    this.speed = 0; // idle initially

    // position + destination
    this.startX = options.startX || 0;
    this.startY = options.startY || 0;
    this.startZ = options.startZ || 0;

    this.dest = options.dest || new THREE.Vector3(0, 0, 0);
    this.runSpeed = options.runSpeed || 0.08;

    this.clock = new THREE.Clock();
    this.accumulator = 0;
    this.currentFrame = 0;

    // idle sprite first
    this.texture = new THREE.TextureLoader().load("sprites/bunny-idle.png");
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.repeat.x = 1 / this.frameCount;

    const geo = new THREE.PlaneGeometry(10, 10);
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(this.startX, this.startY, this.startZ);
    this.scene.add(this.mesh);

    // internal state
    this.isRunning = false;
    this.dir = new THREE.Vector3();

    // flip half the bunnies
    this.flipped = false;
    if (Math.random() < 0.5) {
      this.flipped = true;
    }
  }

  // Trigger bunny to run away
  run() {
    if (this.isRunning) return;

    this.isRunning = true;

    // compute direction from start → destination
    this.dir.copy(this.dest).sub(this.mesh.position).normalize();

    // load running sprite
    this.texture = new THREE.TextureLoader().load("sprites/bunny-run.png");
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.repeat.x = 1 / this.frameCount;
    this.mesh.material.map = this.texture;

    // enable movement speed
    this.speed = this.runSpeed;
  }

  // Update loop
  update() {
    const delta = this.clock.getDelta();

    // animate
    this.accumulator += delta;
    if (this.accumulator > this.animSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.texture.offset.x = this.currentFrame / this.frameCount;
      this.accumulator = 0;
    }

    if (!this.isRunning) {
      this.mesh.lookAt(this.camera.position);
      this.mesh.scale.x = this.flipped ? -1 : 1;
    } else {
      // running → movement
      this.mesh.position.addScaledVector(this.dir, this.speed);

      const angle = Math.atan2(this.dir.x, this.dir.z);
      this.mesh.rotation.set(0, angle + Math.PI / 2, 0);
      this.mesh.scale.x = this.dir.x < 0 ? -1 : 1;

      // check if destination reached
      const dist = this.mesh.position.distanceTo(this.dest);
      if (dist < 1.0) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
      }
    }
  }
}

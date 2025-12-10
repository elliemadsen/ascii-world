// Horse.js

// Sprites are from https://opengameart.org/content/pixel-horse

import * as THREE from "three";

export class Horse {
  constructor(options) {
    this.scene = options.scene;
    this.camera = options.camera;

    this.frameCount = options.frameCount;
    this.speed = options.speed || 0; // default stationary
    this.animSpeed = options.animSpeed || 0.1;
    this.startX = options.startX;
    this.resetX = options.resetX;
    this.y = options.y;
    this.z = options.z;

    this.dir = options.dir;

    this.clock = new THREE.Clock();
    this.accumulator = 0;
    this.currentFrame = 0;

    this.texture = new THREE.TextureLoader().load(options.sprite);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.repeat.x = 1 / this.frameCount;

    const geo = new THREE.PlaneGeometry(8, 8);
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(this.startX, this.y, this.z);
    this.scene.add(this.mesh);
  }

  update() {
    const delta = this.clock.getDelta();

    // animate sprite
    this.accumulator += delta;
    if (this.accumulator > this.animSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.texture.offset.x = this.currentFrame / this.frameCount;
      this.accumulator = 0;
    }

    // moving horse
    if (this.speed != 0) {
      // move
      this.mesh.position.addScaledVector(this.dir, this.speed);

      // loop
      if (this.dir.x > 0 && this.mesh.position.x > this.resetX) {
        this.mesh.position.x = this.startX;
      }

      if (this.dir.x < 0 && this.mesh.position.x < this.resetX) {
        this.mesh.position.x = this.startX;
      }

      // face direction
      this.mesh.scale.x = -Math.sign(this.dir.x);
    }
    // stationary horse
    else {
      // face camera
      this.mesh.lookAt(this.camera.position);
    }
  }
}

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

let hand = new URL("../../models/Hand.obj", import.meta.url);

export class Hand {
  constructor() {
    this.obj;
  }
  async createObject() {
    let loader = new OBJLoader();
    const object = await loader.loadAsync(hand);
    object.scale.set(300, 300, 300);
    object.position.set(0, -500, 50);
    object.rotateZ(0.2);
    object.rotateY(1.5);
    object.rotateX(-0.07);
    this.obj = object;
  }
}

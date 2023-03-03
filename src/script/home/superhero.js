import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

let superhero = new URL("../../models/superhero.obj", import.meta.url);

export class SuperHero {
  constructor() {
    this.obj;
  }
  async createObject() {
    let loader = new OBJLoader();
    const object = await loader.loadAsync(superhero);
    object.scale.set(300, 300, 300);
    object.position.set(430, -1500, 0);
    object.rotateY(-0.43);
    this.obj = object;
  }
}

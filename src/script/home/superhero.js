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
    const materials = new THREE.MeshPhongMaterial({
      color: 0x888888,
      specular: 0xffffff,
      // emissive: 0xffffff,
      shininess: 10,
      opacity: 0.9,
      // transparent: true,
    });

    object.children[0].material = materials;
    object.children[1].material = materials;
    object.children[2].material = materials;
    object.scale.set(300, 300, 300);
    object.position.set(430, -1500, 0);
    object.rotateY(-0.43);
    this.obj = object;
  }
}

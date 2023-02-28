const THREE = require("three");
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default class Debris {
  constructor(x, y, z) {
    this.uniforms = {
      time: {
        type: "f",
        value: 0,
      },
      rotate: {
        type: "f",
        value: Math.random() * 10,
      },
    };
    this.obj = this.createObj(x, y, z);
    // this.obj.position.set(x, y, z);
  }
  createObj(x, y, z) {
    let pyramidT = new THREE.ConeGeometry(100, 100, 4, 1, true);
    let pyramidB = new THREE.ConeGeometry(100, 100, 4, 1, true);
    pyramidB.rotateX(Math.PI);
    pyramidB.translate(0, -100, 0);
    let doublePyramid = BufferGeometryUtils.mergeBufferGeometries([
      pyramidT,
      pyramidB,
    ]);
    return new THREE.Mesh(
      doublePyramid,
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: require("./glsl/pyramid.vert"),
        fragmentShader: require("./glsl/pyramid.frag"),
        transparent: true,
        wireframe: true,
      })
      // new THREE.MeshBasicMaterial({color: 0xffff00})
    );
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}

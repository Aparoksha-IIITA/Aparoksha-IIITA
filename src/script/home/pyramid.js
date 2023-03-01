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
        value: 0,
      },
    };
    this.obj = this.createObj();
    this.obj.position.set(x, y, z);
  }
  createObj() {
    let pyramidT = new THREE.ConeGeometry(100, 100, 4, 1, true);
    let pyramidB = new THREE.ConeGeometry(100, 100, 4, 1, true);
    pyramidB.rotateX(Math.PI);
    pyramidB.translate(0, -100, 0);
    let doublePyramid = BufferGeometryUtils.mergeBufferGeometries([
      pyramidT,
      pyramidB,
    ]);
    let mat = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: false,
    });
    // return new THREE.Mesh(new THREE.ConeGeometry(100, 100, 4, 1, true), mat);
    return new THREE.Mesh(
      doublePyramid,
      // pyramidT,
      // new THREE.RawShaderMaterial({
      //   uniforms: this.uniforms,
      //   vertexShader: require("./glsl/pyramid.vert"),
      //   fragmentShader: require("./glsl/pyramid.frag"),
      //   transparent: true,
      //   // wireframe: true,
      // }),
      new THREE.MeshStandardMaterial({ color: 0x7d8cfa })
    );
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}

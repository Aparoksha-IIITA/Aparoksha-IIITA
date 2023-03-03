import * as THREE from "three";
import { debounce } from "@ykob/js-util";
import { SuperHero } from "./superhero";
import { Hand } from "./hand";

export default function index() {
  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    document.body.clientWidth / window.innerHeight,
    1,
    1000
  );
  const clock = new THREE.Clock();

  const ambientLight = new THREE.AmbientLight(0x33333);
  const directionalLightLeft = new THREE.DirectionalLight(0x0c28ef);
  directionalLightLeft.position.set(-700, 200, 300);
  const directionalLightRight = new THREE.DirectionalLight(0xbf287f);
  directionalLightRight.position.set(400, 200, 300);
  // const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 50);

  const superhero = new SuperHero();
  const hand = new Hand();

  const resizeWindow = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    camera.aspect = document.body.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.body.clientWidth, window.innerHeight);
  };

  const render = () => {
    const time = clock.getDelta();
    renderer.render(scene, camera);
  };
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };
  const on = () => {
    window.addEventListener(
      "resize",
      debounce(() => {
        resizeWindow();
      }),
      1000
    );
  };

  const init = async () => {
    renderer.setSize(document.body.clientWidth, window.innerHeight);
    renderer.setClearColor(0x00275e, 1.0);
    camera.position.z = 800;

    scene.add(ambientLight);
    scene.add(directionalLightLeft);
    scene.add(directionalLightRight);
    // scene.add(dLightHelper);

    Promise.all([superhero.createObject(), hand.createObject()]).then(() => {
      scene.add(superhero.obj);
      scene.add(hand.obj);
    });

    clock.start();

    on();
    resizeWindow();
    renderLoop();
  };
  init();
}

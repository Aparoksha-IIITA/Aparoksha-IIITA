import * as THREE from "three";
import SmoothScrollManager from "../smooth_scroll_manager/SmoothScrollManager";
import { debounce } from "@ykob/js-util";
import BGEffect from "./bgEffect";
import Debris from "./pyramid";
export default function index() {
  const scrollManager = new SmoothScrollManager();

  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });
  const renderBack = new THREE.WebGLRenderTarget(
    document.body.clientWidth,
    window.innerHeight
  );
  const scene = new THREE.Scene();
  const sceneBack = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cameraBack = new THREE.PerspectiveCamera(
    45,
    document.body.clientWidth / window.innerHeight,
    1,
    10000
  );
  const clock = new THREE.Clock();
  const debris = [
    new Debris(-100, 100, -100),
    new Debris(100, 300, -200),
    new Debris(500, -100, -400),
  ];
  const debrisRands = [];
  for (var i = 0; i < 4 * debris.length; i++) {
    debrisRands[i] = Math.random() * 2 - 1;
  }
  const bgEffect = new BGEffect(renderBack.texture);

  const ambientLight = new THREE.AmbientLight(0x33333);
  const directionalLight = new THREE.DirectionalLight(0xbf287f);
  directionalLight.position.set(-400, -200, 300);
  // const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 50);

  const resizeWindow = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    cameraBack.aspect = document.body.clientWidth / window.innerHeight;
    cameraBack.updateProjectionMatrix();
    renderBack.setSize(document.body.clientWidth, window.innerHeight);
    renderer.setSize(document.body.clientWidth, window.innerHeight);
    bgEffect.resize();
  };

  const render = () => {
    const time = clock.getDelta();
    bgEffect.render(time);
    for (var i = 0; i < debris.length; i++) {
      debris[i].obj.rotateX((Math.PI * time * debrisRands[4 * i] * debrisRands[4*i +3]) / 5);
      debris[i].obj.rotateY((Math.PI * time * debrisRands[4 * i + 1] * debrisRands[4*i +3]) / 5);
      debris[i].obj.rotateZ((Math.PI * time * debrisRands[4 * i + 2] * debrisRands[4*i +3]) / 5);
      debris[i].render(time);
    }
    renderer.setRenderTarget(renderBack);
    renderer.render(sceneBack, cameraBack);
    renderer.setRenderTarget(null);
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

    scrollManager.renderNext = () => {
      if (scrollManager.isValidSmooth()) {
        cameraBack.position.y = scrollManager.hookes.contents.velocity[1] * 0.6;
      } else {
        cameraBack.position.y = scrollManager.scrollTop * -1;
      }
    };
  };

  const init = () => {
    renderer.setSize(document.body.clientWidth, window.innerHeight);
    renderer.setClearColor(0x111111, 1.0);
    cameraBack.position.z = 800;

    scene.add(bgEffect.obj);
    for (var i = 0; i < debris.length; i++) {
      sceneBack.add(debris[i].obj);
    }
    sceneBack.add(ambientLight);
    sceneBack.add(directionalLight);
    // sceneBack.add(dLightHelper);
    clock.start();

    on();
    resizeWindow();
    renderLoop();
    scrollManager.start();
  };
  init();
}

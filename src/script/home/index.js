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
  // const directionalLightLeft = new THREE.DirectionalLight(0x0c28ef);
  // directionalLightLeft.position.set(-700, 200, 300);
  // const directionalLightRight = new THREE.DirectionalLight(0xbf287f);
  // directionalLightRight.position.set(400, 200, 300);
  // const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 50);
  const light1 = new THREE.PointLight(0xbf287f, 5, 800, 5);
  light1.position.set(400, -200, 300);
  light1.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x00275e })
    )
  );
  const light2 = new THREE.PointLight(0x0c28ef, 5, 800);
  light2.position.set(0, 200, 300);
  light2.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x00275e })
    )
  );

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
  let goUp = true;
  let angle = 0.0000001;
  const renderLoop = () => {
    render();
    // superhero.obj.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 0), 4);
    // superhero.obj.position.setX = superhero.obj.position.x + angle;
    // console.log(superhero);
    // if (superhero !== undefined) {
    superhero.obj.rotateY(angle);
    hand.obj.rotateY(angle);
    // }
    // angle = angle + 1;
    console.log(angle);
    if (!goUp) {
      if (light1.position.y < -200) (goUp = true), (angle = 0);
      light1.position.setY(light1.position.y - 0.5);
      light2.position.setY(light2.position.y + 0.5);
      angle = angle + 0.0000005;
    } else {
      if (light1.position.y > 200) (goUp = false), (angle = 0);
      light1.position.setY(light1.position.y + 0.5);
      light2.position.setY(light2.position.y - 0.5);
      angle = angle - 0.0000005;
    }
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
    // scene.add(directionalLightLeft);
    // scene.add(directionalLightRight);
    scene.add(light1);
    scene.add(light2);
    // scene.add(dLightHelper);

    Promise.all([superhero.createObject(), hand.createObject()])
      .then(() => {
        scene.add(superhero.obj);
        scene.add(hand.obj);
      })
      .then(() => {
        clock.start();

        on();
        resizeWindow();
        renderLoop();
      });
  };
  init();
}

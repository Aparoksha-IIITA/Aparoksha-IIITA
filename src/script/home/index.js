import * as THREE from "three";
import { debounce } from "@ykob/js-util";
import { SuperHero } from "./superhero";
import { Hand } from "./hand";
import gsap from "gsap";

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

  //Lights

  const ambientLight = new THREE.AmbientLight(0x33333);
  // const directionalLightLeft = new THREE.DirectionalLight(0x0c28ef, 0.8);
  // directionalLightLeft.position.set(400, 200, 300);
  // const directionalLightRight = new THREE.DirectionalLight(0xbf287f, 0.8);
  // directionalLightRight.position.set(-700, 200, 300);
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

  //Models
  const superhero = new SuperHero();
  const hand = new Hand();

  //Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener("mousemove", onMouseMove, false);
  //Raycaster Ground
  const groundGeometry = new THREE.PlaneGeometry(400, 400);
  const groundMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.0,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.setX(-300);
  ground.position.setY(-50);

  // ground.position.setZ(-100);
  scene.add(ground);

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
    // }
    // angle = angle + 1;
    // console.log(angle);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([ground]);

    if (intersects.length) {
      const { point } = intersects[0];
      console.log(THREE.Clock);
      // console.log(point);
      // hand.obj.position.copy(point);
      gsap.to(hand.obj.position, {
        x: point.x + 55,
        y: point.y - 450,
        duration: 0.5,
      });
      // let originalPositionY = hand.obj.position.y;
      // let originalPositionX = hand.obj.position.x;
      // hand.obj.position.setY(originalPositionY - 450);
      // hand.obj.position.setX(originalPositionX + 55);
      // console.log(hand.obj.position.y);
    } else {
      superhero.obj.rotateY(angle);
      hand.obj.rotateY(angle);
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

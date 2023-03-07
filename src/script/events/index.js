import * as THREE from "three";

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

import imageOne from "../../assets/images/1.jpeg";
import imageTwo from "../../assets/images/2.jpeg";
import imageThree from "../../assets/images/3.jpeg";
import imageFour from "../../assets/images/4.jpeg";

const images = {
  imageOne,
  imageTwo,
  imageThree,
  imageFour,
};

import vertex from "./glsl/image.vert";
import fragment from "./glsl/image.frag";

import eventDataInit from "./eventDetails";

export default function index() {
  let targetX = 0;
  let targetY = 0;

  const textureOne = new THREE.TextureLoader().load(images.imageOne);
  const textureTwo = new THREE.TextureLoader().load(images.imageTwo);
  const textureThree = new THREE.TextureLoader().load(images.imageThree);
  const textureFour = new THREE.TextureLoader().load(images.imageFour);

  let container = document.querySelector("main");
  let links = [...document.querySelectorAll("li")];
  let perspective = 1000;
  let sizes = new THREE.Vector2(0, 0);
  let linkHovered = false;
  let offset = new THREE.Vector2(0, 0); // Positions of mesh on screen. Will be updated below.
  let uniforms = {
    uTexture: { value: new THREE.TextureLoader().load(images.imageThree) },
    uAlpha: { value: 0.0 },
    uOffset: { value: new THREE.Vector2(0.0, 0.0) },
  };

  links.forEach((link, idx) => {
    link.addEventListener("mouseenter", () => {
      switch (idx) {
        case 0:
          uniforms.uTexture.value = textureOne;
          break;
        case 1:
          uniforms.uTexture.value = textureTwo;
          break;
        case 2:
          uniforms.uTexture.value = textureThree;
          break;
        case 3:
          uniforms.uTexture.value = textureFour;
          break;
        case 4:
          uniforms.uTexture.value = textureOne;
          break;
        case 5:
          uniforms.uTexture.value = textureTwo;
          break;
        case 6:
          uniforms.uTexture.value = textureThree;
          break;
        case 7:
          uniforms.uTexture.value = textureFour;
          break;
      }
    });

    link.addEventListener("mouseleave", () => {
      uniforms.uAlpha.value = lerp(uniforms.uAlpha.value, 0.0, 0.1);
    });
  });

  let scene = new THREE.Scene();
  let fov =
    (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
  let camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, perspective);

  let renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  let mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 20, 20),
    new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      // wireframe: true,
      // side: THREE.DoubleSide
    })
  );

  function addEventListeners(element) {
    element.addEventListener("mouseenter", () => {
      linkHovered = true;
    });
    element.addEventListener("mouseleave", () => {
      linkHovered = false;
    });
  }

  function updateMeshDimensions() {
    sizes.set(window.innerWidth / 2, window.innerHeight, 1);
    mesh.scale.set(sizes.x, sizes.y, 1);
    mesh.position.set(offset.x, offset.y, 0);
    scene.add(mesh);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov =
      (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateMeshDimensions();

    camera.updateProjectionMatrix();
  }

  function onMouseMove() {
    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });
  }

  function render() {
    offset.x = lerp(offset.x, targetX, 0.1);
    offset.y = lerp(offset.y, targetY, 0.1);
    uniforms.uOffset.value.set(
      (targetX - offset.x) * 0.0005,
      -(targetY - offset.y) * 0.0005
    );
    mesh.position.set(window.innerWidth / 4, 0, 0);

    // set uAlpha when list is hovered / unhovered
    linkHovered
      ? (uniforms.uAlpha.value = lerp(uniforms.uAlpha.value, 1.0, 0.1))
      : (uniforms.uAlpha.value = lerp(uniforms.uAlpha.value, 0.0, 0.1));

    for (let i = 0; i < links.length; i++) {
      if (linkHovered) {
        links[i].style.opacity = 0.2;
      } else {
        links[i].style.opacity = 1;
      }
    }

    renderer.render(scene, camera);
  }

  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  };

  function init() {
    eventDataInit();
    addEventListeners(document.querySelector("ul"));
    onMouseMove();
    renderLoop();
    updateMeshDimensions();
    window.addEventListener("resize", onWindowResize);
  }
  init();
}

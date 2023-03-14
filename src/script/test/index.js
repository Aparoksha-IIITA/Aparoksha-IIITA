import * as THREE from "three";
import dat from "dat.gui";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmShader } from "three/examples/jsm/shaders/FilmShader";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const BadTVShader = {
  uniforms: {
    tDiffuse: { type: "t", value: null },
    time: { type: "f", value: 0.0 },
    distortion: { type: "f", value: 3.0 },
    distortion2: { type: "f", value: 5.0 },
    speed: { type: "f", value: 0.2 },
    rollSpeed: { type: "f", value: 0.1 },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform float time;",
    "uniform float distortion;",
    "uniform float distortion2;",
    "uniform float speed;",
    "uniform float rollSpeed;",
    "varying vec2 vUv;",

    // Start Ashima 2D Simplex Noise

    "vec3 mod289(vec3 x) {",
    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec2 mod289(vec2 x) {",
    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec3 permute(vec3 x) {",
    "  return mod289(((x*34.0)+1.0)*x);",
    "}",

    "float snoise(vec2 v)",
    "  {",
    "  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
    "                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
    "                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
    "                      0.024390243902439); // 1.0 / 41.0",
    "  vec2 i  = floor(v + dot(v, C.yy) );",
    "  vec2 x0 = v -   i + dot(i, C.xx);",

    "  vec2 i1;",
    "  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec4 x12 = x0.xyxy + C.xxzz;",
    " x12.xy -= i1;",

    "  i = mod289(i); // Avoid truncation effects in permutation",
    "  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
    "		+ i.x + vec3(0.0, i1.x, 1.0 ));",

    "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
    "  m = m*m ;",
    "  m = m*m ;",

    "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "  vec3 h = abs(x) - 0.5;",
    "  vec3 ox = floor(x + 0.5);",
    "  vec3 a0 = x - ox;",

    "  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

    "  vec3 g;",
    "  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
    "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "  return 130.0 * dot(m, g);",
    "}",

    // End Ashima 2D Simplex Noise

    "void main() {",

    "vec2 p = vUv;",
    "float ty = time*speed;",
    "float yt = p.y - ty;",
    //smooth distortion
    "float offset = snoise(vec2(yt*3.0,0.0))*0.2;",
    // boost distortion
    "offset = offset*distortion * offset*distortion * offset;",
    //add fine grain distortion
    "offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;",
    //combine distortion on X with roll on Y
    "gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));",

    "}",
  ].join("\n"),
};
const VolumetericLightShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
    exposure: { value: 1 },
    decay: { value: 1 },
    density: { value: 6 },
    weight: { value: 0.57 },
    samples: { value: 30 },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}",
  ].join("\n"),

  fragmentShader: [
    "varying vec2 vUv;",
    "uniform sampler2D tDiffuse;",
    "uniform vec2 lightPosition;",
    "uniform float exposure;",
    "uniform float decay;",
    "uniform float density;",
    "uniform float weight;",
    "uniform int samples;",
    "const int MAX_SAMPLES = 100;",
    "void main()",
    "{",
    "vec2 texCoord = vUv;",
    "vec2 deltaTextCoord = texCoord - lightPosition;",
    "deltaTextCoord *= 1.0 / float(samples) * density;",
    "vec4 color = texture2D(tDiffuse, texCoord);",
    "float illuminationDecay = 1.0;",
    "for(int i=0; i < MAX_SAMPLES; i++)",
    "{",
    "if(i == samples) {",
    "break;",
    "}",
    "texCoord += deltaTextCoord;",
    "vec4 sample = texture2D(tDiffuse, texCoord);",
    "sample *= illuminationDecay * weight;",
    "color += sample;",
    "illuminationDecay *= decay;",
    "}",
    "gl_FragColor = color * exposure;",
    "}",
  ].join("\n"),
};
const AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value: null },
    tAdd: { value: null },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
    "vec4 color = texture2D(tDiffuse, vUv);",
    "vec4 add = texture2D(tAdd, vUv);",
    "gl_FragColor = color + add;",
    "}",
  ].join("\n"),
};
const PassThroughShader = {
  uniforms: {
    tDiffuse: { value: null },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
    "gl_FragColor = texture2D(tDiffuse, vec2(vUv.x, vUv.y));",
    "}",
  ].join("\n"),
};

const getImageTexture = (image, density = 1) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const { width, height } = image;

  canvas.setAttribute("width", width * density);
  canvas.setAttribute("height", height * density);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.drawImage(image, 0, 0, width * density, height * density);

  return canvas;
};

const width = 1280;
const height = 720;
const lightColor = 0x0099ff;
const DEFAULT_LAYER = 0;
const OCCLUSION_LAYER = 1;
const renderScale = 0.25;
// const gui = new dat.GUI();
const clock = new THREE.Clock();

let composer,
  filmPass,
  badTVPass,
  bloomPass,
  occlusionComposer,
  itemMesh,
  occMesh,
  occRenderTarget,
  lightSource,
  vlShaderUniforms;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: false,
});
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

function setupScene() {
  lightSource = new THREE.Object3D();
  lightSource.position.x = 0;
  lightSource.position.y = -15;
  lightSource.position.z = -15;

  const itemGeo = new THREE.PlaneGeometry(9, 2.1);
  const itemMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.7,
  });

  const img = new Image();
  img.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/13307/blaster.png";
  img.crossOrigin = "Anonymous";

  img.onload = function () {
    const itemTexture = new THREE.Texture(
      getImageTexture(img),
      null,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      null,
      THREE.LinearFilter
    );

    itemTexture.needsUpdate = true;
    itemMaterial.map = itemTexture;

    itemMesh = new THREE.Mesh(itemGeo, itemMaterial);
    scene.add(itemMesh);

    const occItemMaterial = new THREE.MeshBasicMaterial({ color: lightColor });
    occItemMaterial.map = itemTexture;
    occMesh = new THREE.Mesh(itemGeo, occItemMaterial);
    occMesh.layers.set(OCCLUSION_LAYER);
    scene.add(occMesh);
  };

  camera.position.z = 4.5;
}

function setupPostprocessing() {
  occRenderTarget = new THREE.WebGLRenderTarget(
    width * renderScale,
    height * renderScale
  );

  // Blur passes
  const hBlur = new ShaderPass(HorizontalBlurShader);
  const vBlur = new ShaderPass(VerticalBlurShader);
  const bluriness = 7;
  hBlur.uniforms.h.value = bluriness / width;
  vBlur.uniforms.v.value = bluriness / height;

  // Bad TV Pass
  badTVPass = new ShaderPass(BadTVShader);
  badTVPass.uniforms.distortion.value = 1.9;
  badTVPass.uniforms.distortion2.value = 1.2;
  badTVPass.uniforms.speed.value = 0.1;
  badTVPass.uniforms.rollSpeed.value = 0;

  // Volumetric Light Pass
  const vlPass = new ShaderPass(VolumetericLightShader);
  vlShaderUniforms = vlPass.uniforms;
  vlPass.needsSwap = false;

  // Occlusion Composer
  occlusionComposer = new EffectComposer(renderer, occRenderTarget);
  occlusionComposer.addPass(new RenderPass(scene, camera));
  occlusionComposer.addPass(hBlur);
  occlusionComposer.addPass(vBlur);
  occlusionComposer.addPass(hBlur);
  occlusionComposer.addPass(vBlur);
  occlusionComposer.addPass(hBlur);
  occlusionComposer.addPass(badTVPass);
  occlusionComposer.addPass(vlPass);

  // Bloom pass
  bloomPass = new UnrealBloomPass(width / height, 0.5, 0.8, 0.3);

  // Film pass
  filmPass = new ShaderPass(FilmShader);
  filmPass.uniforms.sCount.value = 1200;
  filmPass.uniforms.grayscale.value = false;
  filmPass.uniforms.sIntensity.value = 1.5;
  filmPass.uniforms.nIntensity.value = 0.2;

  // Blend occRenderTarget into main render target
  const blendPass = new ShaderPass(AdditiveBlendingShader);
  blendPass.uniforms.tAdd.value = occRenderTarget.texture;
  blendPass.renderToScreen = true;

  // Main Composer
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloomPass);
  composer.addPass(badTVPass);
  composer.addPass(filmPass);
  composer.addPass(blendPass);
}

function onFrame() {
  requestAnimationFrame(onFrame);
  update();
  render();
}

function update() {
  const timeDelta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  filmPass.uniforms.time.value += timeDelta;
  badTVPass.uniforms.time.value += 0.01;

  if (itemMesh) {
    itemMesh.rotation.y = Math.sin(elapsed / 2) / 15;
    itemMesh.rotation.z = Math.cos(elapsed / 2) / 50;
    occMesh.rotation.copy(itemMesh.rotation);
  }
}

function render() {
  camera.layers.set(OCCLUSION_LAYER);
  //renderer.setClearColor(0x000000);
  occlusionComposer.render();

  camera.layers.set(DEFAULT_LAYER);
  //renderer.setClearColor(0x000000);
  composer.render();
}

// function setupGUI() {
//   let folder,
//     min,
//     max,
//     step,
//     updateShaderLight = function () {
//       const p = lightSource.position.clone(),
//         vector = p.project(camera),
//         x = (vector.x + 1) / 2,
//         y = (vector.y + 1) / 2;
//       vlShaderUniforms.lightPosition.value.set(x, y);
//     };

//   updateShaderLight();

//   // Bloom Controls
//   folder = gui.addFolder("Bloom");
//   folder.add(bloomPass, "radius").min(0).max(10).name("Radius");
//   folder.add(bloomPass, "threshold").min(0).max(1).name("Threshold");
//   folder.add(bloomPass, "strength").min(0).max(10).name("Strength");
//   folder.open();

//   // Bad TV Controls
//   folder = gui.addFolder("TV");
//   folder
//     .add(badTVPass.uniforms.distortion, "value")
//     .min(0)
//     .max(10)
//     .name("Distortion 1");
//   folder
//     .add(badTVPass.uniforms.distortion2, "value")
//     .min(0)
//     .max(10)
//     .name("Distortion 2");
//   folder.add(badTVPass.uniforms.speed, "value").min(0).max(1).name("Speed");
//   folder
//     .add(badTVPass.uniforms.rollSpeed, "value")
//     .min(0)
//     .max(10)
//     .name("Roll Speed");
//   folder.open();

//   // Light Controls
//   folder = gui.addFolder("Light Position");
//   folder
//     .add(lightSource.position, "x")
//     .min(-50)
//     .max(50)
//     .onChange(updateShaderLight);
//   folder
//     .add(lightSource.position, "y")
//     .min(-50)
//     .max(50)
//     .onChange(updateShaderLight);
//   folder
//     .add(lightSource.position, "z")
//     .min(-50)
//     .max(50)
//     .onChange(updateShaderLight);
//   folder.open();

//   // Volumetric Light Controls
//   folder = gui.addFolder("Volumeteric Light Shader");
//   folder.add(vlShaderUniforms.exposure, "value").min(0).max(1).name("Exposure");
//   folder.add(vlShaderUniforms.decay, "value").min(0).max(1).name("Decay");
//   folder.add(vlShaderUniforms.density, "value").min(0).max(10).name("Density");
//   folder.add(vlShaderUniforms.weight, "value").min(0).max(1).name("Weight");
//   folder.add(vlShaderUniforms.samples, "value").min(1).max(100).name("Samples");

//   folder.open();
// }

function addRenderTargetImage() {
  const material = new THREE.ShaderMaterial(PassThroughShader);
  material.uniforms.tDiffuse.value = occRenderTarget.texture;

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  //   console.log(composer);
  //   composer.passes[1].scene.add(mesh);

  mesh.visible = false;

  //   const folder = gui.addFolder("Light Pass Render Image");
  //   folder.add(mesh, "visible");
  //   folder.open();
}

setupScene();
setupPostprocessing();
onFrame();
// setupGUI();
addRenderTargetImage();

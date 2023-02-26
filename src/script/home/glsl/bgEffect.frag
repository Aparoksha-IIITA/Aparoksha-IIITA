precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;

varying vec2 vUv;

const float duration = 8.0;
const float delay = 4.0;

#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)
#pragma glslify: random = require(@ykob/glsl-util/src/random);
#pragma glslify: convertHsvToRgb = require(@ykob/glsl-util/src/convertHsvToRgb);
#pragma glslify: varyColor = require(../../common/glsl/varyColor.glsl)

void main() {
  float now = clamp((time - delay) / duration, 0.0, 1.0);

  // white noise
  float whiteNoise = random(vUv.xy * time) * 0.1 - 0.1;

  // CRT TV Effect
  float monitor1 = abs(sin(vUv.y * resolution.y * 2.4 + time * 10.0)) * 0.04;
  float monitor2 = abs(sin(vUv.y * resolution.y * 1.0 + time * 3.0)) * 0.04;
  float monitor = monitor1 - monitor2;

  // Vignette
  float vignetteMask = smoothstep(0.8, 1.4, length(vUv * 2.0 - 1.0));
  vec3 vignetteColor = varyColor(time);
  vec3 vignette = vignetteMask * vignetteColor * 0.1;

  // RGB
  float r = texture2D(texture, vUv - vec2(2.0, 0.0) / resolution).r;
  float g = texture2D(texture, vUv).g;
  float b = texture2D(texture, vUv + vec2(2.0, 0.0) / resolution).b;

  gl_FragColor = vec4((vec3(r, g, b) + whiteNoise) + monitor + vignette, 1.0);
}
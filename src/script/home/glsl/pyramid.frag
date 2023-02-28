precision highp float;

uniform float time;

#pragma glslify: varyColor = require(../../common/glsl/varyColor.glsl);

void main() {
  vec3 rgb = varyColor(time);
  gl_FragColor = vec4(rgb, 0.25);
}

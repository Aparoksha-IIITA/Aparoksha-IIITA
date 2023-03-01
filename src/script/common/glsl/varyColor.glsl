vec3 varyColor(float time) {
    vec3 pink = vec3(0.75, 0.16, 0.50);
    vec3 blue = vec3(0.05, 0.16, 0.94);
    return mix(pink, blue, sin(time*0.5));
}
// bf287f 0c28ef
#pragma glslify: export(varyColor)
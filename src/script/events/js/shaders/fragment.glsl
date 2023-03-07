uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;
varying vec2 vUv;

vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset ){
    float r = texture2D(textureimage, uv+offset).r;
    float g = texture2D(textureimage, uv).g;
    float b = texture2D(textureimage, uv+offset).b;
    r= r + texture2D(textureimage, uv).r;
    g= g + texture2D(textureimage , uv).g;
    b= b +texture2D(textureimage, uv-offset).b;
    r = r*0.5;
    g = g*0.5;
    b = b*0.5;
    return vec3(r, g, b);
}

void main(){
    // vec3 color = texture2D(uTexture, vUv).rgb;
    vec3 color = rgbShift(uTexture, vUv, uOffset);
    gl_FragColor = vec4(color, uAlpha);
}
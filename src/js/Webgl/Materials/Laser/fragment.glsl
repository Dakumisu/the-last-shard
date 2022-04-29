#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {

  float time = uTime * 0.0001;

  vec3 normal = vNormal;


  vec2 uv = vUv;
  uv += sin(uv);
  uv =  fract(uv + time);

  float noiseUv = abs(cnoise(uv * 2. + time));

  float textUv = texture2D(uTexture, uv).r;

  vec3 pos = vPos;
  pos.xz += sin(uv);
  pos =  fract(pos + time);

  float noisePos = abs(cnoise(pos.xz * 2. + time));

  float textPos = texture2D(uTexture, pos.xz).r;

  float render = mix(textPos, textUv, noiseUv / noisePos);
  float render2 = mix(textUv, textPos, noiseUv / noisePos);

  float sStart = smoothstep(0., 0.25, vUv.x);
  float sEnd = smoothstep(0., 0.25, 1.0 - vUv.x);
  float sEdges = sStart * sEnd;

  gl_FragColor = vec4(vec3(vNormal), sEdges);
  gl_FragColor = vec4(vec3(render), sEdges);
}
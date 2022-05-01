#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {

  float time = -uTime * 0.00025;

  vec3 normal = vNormal;

  float noiseFactor = 2.;

  // Uv repeat with noise
  vec2 uv = vUv;

  uv += uv;
  uv = fract(uv + time);

  float noiseUv = (cnoise(uv * noiseFactor + time));
  float noiseUvHigh = abs(cnoise(uv * noiseFactor * 2. + time));

  float textUv = texture2D(uTexture, uv).r;

  // Pos repeat with noise
  vec3 pos = vPos;

  pos.xz += uv;
  pos = fract(pos + time);

  float noisePos = (cnoise(pos.xz * noiseFactor + time));
  float noisePosHigh = abs(cnoise(pos.xz * noiseFactor * 2. + time));

  float textPos = texture2D(uTexture, pos.xz).r;

  // RGB
  float firstMix = mix(textPos, textUv, noiseUv / noisePos);
  float lastMix = mix(textPos, textUv, noiseUvHigh / noisePosHigh);
  float mixRender = firstMix + lastMix;

  vec3 color = vec3(0.0, 0.5, 1.0);
  vec3 render = vec3(mixRender) * color;


  vec3 firstRender = mix(vec3(firstMix), color, noiseUv * noisePos);
  vec3 lastRender = mix(vec3(lastMix), color, noiseUvHigh * noisePosHigh);


  // Alpha
  float smoothUvStart = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, uv).r;
  float smoothUvEnd = 1.0 - smoothstep(noisePosHigh * noiseUvHigh, 1.0, 1.0 - uv).r;
  float SmoothUv = smoothUvStart * smoothUvEnd;


  gl_FragColor = vec4(render, mixRender);
}
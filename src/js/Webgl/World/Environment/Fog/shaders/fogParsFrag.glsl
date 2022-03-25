#ifdef USE_FOG
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

uniform float uTime;

uniform vec3 uFogNearColor;
uniform float uFogNoiseSpeed;
uniform float uFogNoiseFreq;
uniform float uFogNoiseImpact;
uniform float uFogNoiseAmount;

varying vec3 vFogWorldPosition;
varying float fogDepth;
#endif

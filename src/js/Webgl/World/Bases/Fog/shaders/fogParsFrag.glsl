#ifdef USE_FOG
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

uniform vec3 uFogNearColor;
uniform float uFogNoiseSpeed;
uniform float uFogNoiseFreq;
uniform float uFogNoiseImpact;

varying vec3 vFogWorldPosition;
varying float fogDepth;
#endif
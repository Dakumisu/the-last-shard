#ifdef USE_FOG
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform vec3 fogColor;
uniform float uFogNear;
uniform float uFogFar;

uniform vec3 uFogNearColor;
uniform vec3 uFogFarColor;
uniform float uFogNoiseSpeed;
uniform float uFogNoiseFreq;
uniform float uFogNoiseImpact;
uniform float uFogHeightPropagation;
uniform float uFogHeightDensity;

varying vec3 vFogWorldPosition;
varying float fogDepth;
varying float vFogDepth;
varying float vFogHeight;
#endif

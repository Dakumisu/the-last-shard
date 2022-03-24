#ifdef USE_FOG
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')
uniform vec3 fogColor;
uniform vec3 fogNearColor;
varying vec3 vFogWorldPosition;
varying float fogDepth;
uniform float fogNear;
uniform float fogFar;
uniform float time;
uniform float fogNoiseSpeed;
uniform float fogNoiseFreq;
uniform float fogNoiseImpact;
uniform float fogNoiseAmount;
#endif

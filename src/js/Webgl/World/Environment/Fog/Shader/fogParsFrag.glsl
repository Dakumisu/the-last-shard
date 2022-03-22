#ifdef USE_FOG
#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/3d')
uniform vec3 fogColor;
uniform vec3 fogNearColor;
varying float fogDepth;
varying vec3 test;
	#ifdef FOG_EXP2
uniform float fogDensity;
	#else
uniform float fogNear;
uniform float fogFar;
	#endif
varying vec3 vFogWorldPosition;
uniform float time;
uniform float fogNoiseSpeed;
uniform float fogNoiseFreq;
uniform float fogNoiseImpact;
#endif

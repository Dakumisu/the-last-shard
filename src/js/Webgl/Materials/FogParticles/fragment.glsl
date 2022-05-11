#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uFogTexture;

varying float vNoise;
varying float vFade;
varying float vLoop;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

void main() {
	float time = uTime * 0.0002;

	vec2 uv = vUv;

	vec2 rotatedUv = rotate(vUv, vNoise * PI, vec2(0.5));

	float text = texture2D(uFogTexture, rotatedUv).a;

	// Smooth edges
	float dist = length(rotatedUv - 0.5);
	dist = 1.0 - dist * 2.;

	// Smooth apparition with mouvement
	float loopEnd = 1.0 - vLoop;
	float loopStart = vLoop;
	float loop = loopStart * loopEnd;

	gl_FragColor = vec4( vFade) ;
	gl_FragColor = vec4(vec3(text) * uColor2, text * dist * vFade * loop * 0.5 );
}

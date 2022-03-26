varying vec2 vUv;
varying vec2 vTextUv;
varying vec3 vPosition;

uniform float uTime;
uniform sampler2D uTexture;

#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')

void main() {
	float noise = cnoise(vUv + uTime);
	float noise2 = 1.0 - cnoise(vUv * 0.1 + uTime * 0.1);
	float distFront = 1.0 - smoothstep(0.1, 1., -vPosition.z);
	float distBack = smoothstep(1., .1, vPosition.z);
	float distY = smoothstep(0.0, .1, vPosition.y);

	vec4 text2 = texture2D(uTexture, vTextUv) * 0.5;

	vec2 textUv = vTextUv * noise2;

	textUv += sin(textUv);
	textUv = fract(textUv + vec2(0.0, uTime * 0.1));
	vec4 text = texture2D(uTexture, textUv);
	// text.r *= noise;

	gl_FragColor = vec4(vec3(noise), distFront * distBack * distY * noise * text.r);
	gl_FragColor = vec4(text.rbg, text.a) * text2;
	gl_FragColor = vec4(text.rbg, distFront * distBack * distY * text.a);
}

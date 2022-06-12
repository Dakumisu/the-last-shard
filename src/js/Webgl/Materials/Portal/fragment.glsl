#pragma glslify: cnoise = require('philbin-packages/glsl/noises/classic/2d')


vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform sampler2D uTextureMask;

varying vec2 vUv;

void main() {	
	vec4 textMask = texture2D(uTextureMask, vUv);

	float dist = length(vUv - 0.5);
	vec2 rotatedUv = rotate(vUv, uTime * 0.00075 + (textMask.b ), vec2(0.5));

	vec4 text1 = texture2D(uTexture, rotatedUv);
	vec4 text2 = texture2D(uTexture2, rotatedUv);

	float smoothDist = smoothstep(0., 0.35, dist);

	text1.rgb *= uColor;
	text2.rgb *= uColor2;

	// vec4 render = (text1 + text2) * smoothDist;
	// render += smoothDist * text1.r * 4.;
	vec4 render = (text1 + text2) * smoothDist;
	render *=  text1.b + text2.b;
	// render =  mix(render, textMask, text1.b) * vec4(uColor2, 1.0);

	gl_FragColor = vec4(vUv, vUv);
	gl_FragColor = vec4(vUv, 1.0, 1.0);
	gl_FragColor = vec4(dist);
	gl_FragColor = vec4(text2.r);
	gl_FragColor = vec4(text1.b) * vec4(text2.g) * vec4(uColor2, 1.0);
	gl_FragColor = text2 * smoothstep(0., 0.2, dist);
	gl_FragColor = render;
}

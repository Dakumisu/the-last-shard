/*
	Credits @luruke (https://luruke.medium.com/simple-postprocessing-in-three-js-91936ecadfb7) ⚡️
*/

import {
	WebGLRenderTarget,
	OrthographicCamera,
	BufferGeometry,
	BufferAttribute,
	Mesh,
	Scene,
	RawShaderMaterial,
	Vector2,
	Vector3,
	RGBAFormat,
	Color,
} from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';

import PostFXMaterial from './basic/material';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { loadLUTTexture } from '@utils/loaders/loadAssets';

const tVec2 = new Vector2();
const tVec3 = new Vector3();

const params = {
	postprocess: 1,
	brightness: 0,
	contrast: 0.1,
	radius: 1,
	strength: 0.15,
	threshold: 0.05,
	useFxaa: true,
};

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Post FX',
	tab: 'Env',
};
/// #endif

export default class PostFX {
	constructor(renderer) {
		const webgl = getWebgl();
		this.rendererScene = webgl.mainScene.instance;
		this.rendererCamera = webgl.camera.instance;

		this.renderer = renderer;

		// this.renderer.getDrawingBufferSize(tVec2);

		// this.setEnvironnement();
		// this.setTriangle();
		// this.setRenderTarget();
		// this.setMaterial();
		this.setPostPro();

		initialized = true;

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this.lutPass, 'intensity', {
			min: 0,
			max: 1,
		});

		// gui.addInput(params, 'brightness', {
		// 	label: 'brightness',
		// 	min: -1,
		// 	max: 1,
		// 	step: 0.01,
		// }).on('change', (e) => {
		// 	this.customPass.uniforms.uBrightness.value = e.value;
		// });
		// gui.addInput(params, 'contrast', {
		// 	label: 'contrast',
		// 	min: -1,
		// 	max: 1,
		// 	step: 0.01,
		// }).on('change', (e) => {
		// 	this.customPass.uniforms.uContrast.value = e.value;
		// });
		// gui.addInput(params, 'radius', {
		// 	label: 'radius',
		// 	min: 0,
		// 	max: 1,
		// 	step: 0.01,
		// }).on('change', (e) => {
		// 	this.unrealBloomPass.radius = e.value;
		// });
		// gui.addInput(params, 'strength', {
		// 	label: 'strength',
		// 	min: 0,
		// 	max: 1,
		// 	step: 0.01,
		// }).on('change', (e) => {
		// 	this.unrealBloomPass.strength = e.value;
		// });
		// gui.addInput(params, 'threshold', {
		// 	label: 'threshold',
		// 	min: 0,
		// 	max: 1,
		// 	step: 0.01,
		// }).on('change', (e) => {
		// 	this.unrealBloomPass.threshold = e.value;
		// });
	}
	/// #endif

	// setEnvironnement() {
	// 	this.scene = new Scene();
	// 	this.dummyCamera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2);
	// }

	// setTriangle() {
	// 	this.geometry = new BufferGeometry();

	// 	const vertices = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);

	// 	this.geometry.setAttribute('position', new BufferAttribute(vertices, 2));
	// }

	// setRenderTarget() {
	// 	this.target = new WebGLRenderTarget(tVec2.x, tVec2.y, {
	// 		format: RGBAFormat,
	// 		stencilBuffer: false,
	// 		depthBuffer: true,
	// 	});
	// }

	// setMaterial() {
	// 	const opts = {
	// 		defines: {
	// 			FXAA: params.useFxaa,
	// 		},
	// 		uniforms: {
	// 			POST_PROCESSING: { value: params.postprocess },
	// 			uScene: { value: this.target.texture },
	// 			uResolution: { value: tVec3 },
	// 			uBrightness: { value: params.brightness },
	// 			uContrast: { value: params.contrast },
	// 		},
	// 	};

	// 	this.material = PostFXMaterial.get(opts);
	// }

	async setPostPro() {
		// this.triangle = new Mesh(this.geometry, this.material);
		// this.triangle.frustumCulled = false;

		// this.scene.add(this.triangle);

		this.composer = new EffectComposer(this.renderer);
		this.composer.setSize(store.resolution.width, store.resolution.height);
		this.composer.setPixelRatio(Math.min(store.resolution.dpr, 2));

		const renderPass = new RenderPass(this.rendererScene, this.rendererCamera);
		this.composer.addPass(renderPass);

		// this.unrealBloomPass = new UnrealBloomPass();
		// this.composer.addPass(this.unrealBloomPass);
		// this.unrealBloomPass.strength = params.strength;
		// this.unrealBloomPass.radius = params.radius;
		// this.unrealBloomPass.threshold = params.threshold;

		this.lutPass = new LUTPass();
		this.lutPass.lut = await loadLUTTexture('test-lut');
		this.lutPass.intensity = 0;

		this.composer.addPass(this.lutPass);

		// 	const customShader = {
		// 		uniforms: {
		// 			tDiffuse: { value: null },
		// 			uBrightness: { value: params.brightness },
		// 			uContrast: { value: params.contrast },
		// 		},
		// 		vertexShader: `
		// 		varying vec2 vUv;
		//     void main()
		//     {
		//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

		// 		vUv = uv;
		//     }
		// `,
		// 		fragmentShader: `
		// 		uniform sampler2D tDiffuse;
		// 		uniform float uContrast;
		// 		uniform float uBrightness;

		// 		varying vec2 vUv;
		//     void main()
		//     {
		// 		// POST PROCESSING
		// 		float dist = smoothstep(0., 1.0, 1.0 - (length(vUv - 0.5) * 0.5));
		// 		vec3 postPro = texture2D(tDiffuse, vUv).rgb;

		// 		gl_FragColor = vec4(vec3(dist), 1.0);
		// 		gl_FragColor = vec4(postPro * vec3(dist), 1.0);
		// 		gl_FragColor = vec4(postPro, 1.0) * dist;
		// 		gl_FragColor.rgb += uBrightness;

		// 		if(uContrast > 0.0) {
		// 			gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - uContrast) + 0.5;
		// 		} else {
		// 			gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + uContrast) + 0.5;
		// 		}
		//     }
		// `,
		// 	};

		// this.customPass = new ShaderPass(customShader);

		// this.composer.addPass(this.customPass);

		// const glitch = new GlitchPass();
		// this.composer.addPass(glitch);
	}

	resize(width, height) {
		if (!initialized) return;

		// tVec2.set(width, height);
		// tVec3.x = tVec2.x;
		// tVec3.y = tVec2.y;

		this.composer.setSize(store.resolution.width, store.resolution.height);
		this.composer.setPixelRatio(Math.min(store.resolution.dpr, 2));

		// this.material.uniforms.uResolution.value = tVec3;
	}

	updateDPR(dpr) {
		if (!initialized) return;

		tVec3.z = dpr;

		// this.material.uniforms.uResolution.value = tVec3;
	}

	render() {
		if (!initialized) return;

		// this.renderer.setRenderTarget(this.target);
		// this.renderer.render(this.rendererScene, this.rendererCamera);
		// this.renderer.setRenderTarget(null);
		// this.renderer.render(this.scene, this.dummyCamera);

		this.composer.render();
	}

	// destroy() {
	// 	this.target.dispose();
	// }
}

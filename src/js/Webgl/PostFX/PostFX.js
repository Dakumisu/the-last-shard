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
	Vector2,
	Vector3,
	RGBAFormat,
	GLSL3,
} from 'three';

import { getWebgl } from '@webgl/Webgl';

import PostFXMaterial from './basic/material';
import { loadLUTTexture } from '@utils/loaders/loadAssets';
import Lut from './Lut';

const tVec2 = new Vector2();
const tVec3 = new Vector3();

const params = {
	postprocess: 0,
	useFxaa: true,
};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Post FX',
};
/// #endif

export default class PostFX {
	static initialized;
	constructor(renderer) {
		const webgl = getWebgl();
		this.rendererScene = webgl.mainScene.instance;
		this.rendererCamera = webgl.camera.instance;

		this.renderer = renderer;

		this.renderer.getDrawingBufferSize(tVec2);

		// Init render target
		this.scene = new Scene();
		this.dummyCamera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2);
		this.target = new WebGLRenderTarget(tVec2.x, tVec2.y, {
			format: RGBAFormat,
			stencilBuffer: false,
			depthBuffer: true,
		});

		const geometry = new BufferGeometry();
		const vertices = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);
		geometry.setAttribute('position', new BufferAttribute(vertices, 2));

		this.material = PostFXMaterial.get({
			// defines: {
			// 	FXAA: params.useFxaa,
			// },
			uniforms: {
				// POST_PROCESSING: { value: params.postprocess },
				uScene: { value: this.target.texture },
				uResolution: { value: tVec3 },

				uLut1: { value: null },
				uLut2: { value: null },
				uLutSize: { value: 0 },

				uLutIntensity1: { value: 1.0 },
				uLutIntensity2: { value: 1.0 },
			},
		});

		const triangle = new Mesh(geometry, this.material);
		triangle.frustumCulled = false;
		this.scene.add(triangle);

		const lut = new Lut({ material: this.material, lutKey: 'lut-2' });
		const lut2 = new Lut({ material: this.material, lutKey: 'lut-1' });

		PostFX.initialized = true;

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(this.material.uniforms.uLutIntensity1, 'value', {
			min: 0,
			max: 1,
			label: 'Intensity',
		});
	}
	/// #endif

	resize(width, height) {
		if (!PostFX.initialized) return;

		tVec2.set(width, height);
		tVec3.x = tVec2.x;
		tVec3.y = tVec2.y;

		this.material.uniforms.uResolution.value = tVec3;
	}

	updateDPR(dpr) {
		if (!PostFX.initialized) return;

		tVec3.z = dpr;

		this.material.uniforms.uResolution.value = tVec3;
	}

	render() {
		if (!PostFX.initialized) return;

		this.renderer.setRenderTarget(this.target);
		this.renderer.render(this.rendererScene, this.rendererCamera);
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.dummyCamera);
	}

	destroy() {
		this.target.dispose();
	}
}

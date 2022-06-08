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
} from 'three';

import { getWebgl } from '@webgl/Webgl';

import PostFXMaterial from './basic/material';
import Lut from './Lut';
import anime from 'animejs';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';

const tVec2 = new Vector2();
const tVec3 = new Vector3();

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

				// LUT
				uLut1: { value: null },
				uLut2: { value: null },
				uLutSize: { value: 0 },
				uLutIntensity: { value: 0 },
				uGlobalLutIntensity: { value: 1 },

				// Transition
				uTransition: { value: 0 },
			},
		});

		const triangle = new Mesh(geometry, this.material);
		triangle.frustumCulled = false;
		this.scene.add(triangle);

		this.currentLut = null;
		this.luts = {};

		this.listeners();
		this.loadLuts();

		PostFX.initialized = true;

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		const options = [];
		console.log(this.luts);
		for (const lut in this.luts) {
			options.push({ text: this.luts[lut].lutKey, value: this.luts[lut].lutKey });
		}

		gui.addInput(this.material.uniforms.uGlobalLutIntensity, 'value', {
			min: 0,
			max: 1,
			label: 'Global LUT',
		});

		gui.addBlade({
			view: 'list',
			label: 'Luts',
			options,
			value: 'lut-1',
		}).on('change', (e) => this.switch(this.luts[e.value], 1000));
	}
	/// #endif

	listeners() {
		signal.on('postpro:transition-in', this.transitionIn.bind(this));
		signal.on('postpro:transition-out', this.transitionOut.bind(this));
	}

	async loadLuts() {
		const lut1 = new Lut({ material: this.material, lutKey: 'lut-1' });
		await lut1.load();
		this.luts['lut-1'] = lut1;

		const lut2 = new Lut({ material: this.material, lutKey: 'lut-2' });
		await lut2.load();
		this.luts['lut-2'] = lut2;

		const lut3 = new Lut({ material: this.material, lutKey: 'lut-3' });
		await lut3.load();
		this.luts['lut-3'] = lut3;

		const lut4 = new Lut({ material: this.material, lutKey: 'lut-4' });
		await lut4.load();
		this.luts['lut-4'] = lut4;

		this.material.uniforms.uLut1.value = lut1.texture;
		this.material.uniforms.uLut2.value = lut2.texture;
		this.material.uniforms.uLutSize.value = lut1.size;

		this.currentLut = lut1;

		/// #if DEBUG
		this.devtool();
		/// #endif
	}

	switch(lut, duration) {
		if (this.currentLut === lut) return;

		if (this.currentLut.texture === this.material.uniforms.uLut1.value) {
			this.material.uniforms.uLut2.value = lut.texture;
			anime({
				targets: this.material.uniforms.uLutIntensity,
				value: 1,
				duration,
				easing: 'linear',
			});
		} else if (this.currentLut.texture === this.material.uniforms.uLut2.value) {
			this.material.uniforms.uLut1.value = lut.texture;
			anime({
				targets: this.material.uniforms.uLutIntensity,
				value: 0,
				duration,
				easing: 'linear',
			});
		}

		this.currentLut = lut;
	}

	transitionIn() {
		anime({
			targets: this.material.uniforms.uTransition,
			value: 1,
			duration: store.game.transition.duration,
			easing: store.game.transition.easing,
		});
	}

	transitionOut() {
		anime({
			targets: this.material.uniforms.uTransition,
			value: 0,
			duration: store.game.transition.duration,
			easing: store.game.transition.easing,
		});
	}

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

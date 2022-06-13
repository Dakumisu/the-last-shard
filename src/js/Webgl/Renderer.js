import signal from 'philbin-packages/signal';
import {
	NoToneMapping,
	PCFShadowMap,
	PCFSoftShadowMap,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer,
} from 'three';

import { getWebgl } from './Webgl';
import PostFX from './PostFX/PostFX';

import { store } from '@tools/Store';
import { clamp } from 'philbin-packages/maths';

const params = {
	clearColor: '#06061c',
};

// Normalize values between 0 - 1, will be multiplied by dpr to get accurate value
const dprList = [0.3, 0.55, 0.8];
let dprQuality = 0;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Renderer',
};
/// #endif

export default class Renderer {
	constructor(opt = {}) {
		const webgl = getWebgl();
		this.scene = webgl.mainScene.instance;
		this.camera = webgl.camera.instance;
		this.canvas = webgl.canvas;

		signal.on('quality', (quality) => {
			if (quality > 2) {
				this.updateDPR(store.resolution.dpr);
			} else {
				const _q = dprList[quality] * store.resolution.dpr;
				if (dprQuality == _q) return;
				dprQuality = _q;

				this.updateDPR(dprQuality);
			}
		});

		this.setRenderer();
		this.setPostProcess();

		this.updateDPR(store.resolution.dpr);

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	devtool() {
		if (debug.instance.stats) {
			this.stats = debug.instance.stats;
			this.context = this.renderer.getContext();
			this.stats.setRenderPanel(this.context);
		}
	}
	/// #endif

	updateDPR(dpr) {
		this.renderer.setPixelRatio(dpr);
		this.postFX.updateDPR(dpr);
	}

	setRenderer() {
		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			alpha: false,
			antialias: false,
			powerPreference: 'high-performance',
			premultipliedAlpha: false,
			autoClear: false,
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFShadowMap;
		// this.renderer.shadowMap.autoUpdate = false;

		const { width, height, dpr } = store.resolution;

		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(Math.min(dpr, 2));
		this.renderer.setClearColor(params.clearColor, 1);

		this.renderer.physicallyCorrectLights = true;
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.toneMapping = NoToneMapping;
		this.renderer.toneMappingExposure = 1;

		store.isWebGL2 = this.renderer.capabilities.isWebGL2;
	}

	setPostProcess() {
		this.postFX = new PostFX(this.renderer);
	}

	resize() {
		const { width, height } = store.resolution;

		this.renderer.setSize(width, height);
		this.postFX.resize(width, height);
	}

	render() {
		/// #if DEBUG
		if (this.stats) this.stats.beforeRender();
		/// #endif

		this.postFX.render();

		/// #if DEBUG
		if (this.stats) this.stats.afterRender();
		/// #endif
	}

	destroy() {
		this.renderer.renderLists.dispose();
		this.postFX.destroy();
		this.renderer.dispose();
	}
}

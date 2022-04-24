import { OrthographicCamera, PerspectiveCamera } from 'three';
import { imageAspect } from 'philbin-packages/maths';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Camera',
};
/// #endif

export default class Camera {
	constructor(opt = {}) {
		const webgl = getWebgl();
		this.scene = webgl.mainScene.instance;

		this.canvas = webgl.canvas;

		this.type = opt.type || 'Perspective';

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.devtool();
		/// #endif
	}

	/// #if DEBUG
	devtool() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		// WIP
	}
	/// #endif

	init() {
		this.type == 'Orthographic' ? this.setOrthographicCamera() : this.setPerspectiveCamera();
		this.setPerspectiveCamera();

		initialized = true;
	}

	setPerspectiveCamera() {
		this.instance = new PerspectiveCamera(75, store.aspect.ratio, 0.1, 1000);
		this.instance.position.set(2, 3, 3);
		this.instance.lookAt(0, 0, 0);
		this.instance.rotation.reorder('YXZ');

		this.scene.add(this.instance);
	}

	setOrthographicCamera() {
		const frustrumSize = 1;
		this.instance = new OrthographicCamera(
			frustrumSize / -2,
			frustrumSize / 2,
			frustrumSize / 2,
			frustrumSize / -2,
			-1000,
			1000,
		);
		this.instance.position.set(0, 0, 1);

		// If you want to keep the aspect of your image
		const aspect = 1 / 1; // Aspect of the displayed image
		const imgAspect = imageAspect(aspect, store.resolution.width, store.resolution.height);
		store.aspect.a1 = imgAspect.a1;
		store.aspect.a2 = imgAspect.a2;

		this.scene.add(this.instance);
	}

	resize() {
		if (this.instance instanceof PerspectiveCamera) {
			this.instance.aspect = store.aspect.ratio;
			this.instance.updateProjectionMatrix();
		}

		if (this.instance instanceof OrthographicCamera) {
			// If you want to keep the aspect of your image in a shader
			const aspect = 1 / 1; // Aspect of the displayed image
			const imgAspect = imageAspect(aspect, store.resolution.width, store.resolution.height);
			store.aspect.a1 = imgAspect.a1;
			store.aspect.a2 = imgAspect.a2;
		}
	}

	update() {
		if (!initialized) return;

		// WIP
	}
}

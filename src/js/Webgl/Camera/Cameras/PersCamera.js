import { CameraHelper, PerspectiveCamera } from 'three';
import { imageAspect } from 'philbin-packages/maths';
import { deferredPromise } from 'philbin-packages/async';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';

export default class PersCamera {
	constructor(label = 'camera_null', params = {}) {
		const webgl = getWebgl();
		this.scene = webgl.mainScene.instance;
		this.canvas = webgl.canvas;
		this.cameraController = webgl.cameraController;

		this.label = label;
		console.log(`[CAMERA] ${this.label}`);
		this.params = params;

		this.initialized = deferredPromise();
	}

	/// #if DEBUG
	devtools(debug) {
		this.camHelper = new CameraHelper(this.instance);
		this.camHelper.visible = false;
		debug.scene.add(this.camHelper);

		this.gui = debug.instance
			.getFolder('CameraController')
			.addFolder({ title: this.label ? this.label : 'null', expanded: false });

		this.gui.addInput(this.camHelper, 'visible', {
			label: 'Show Helper',
		});
	}
	/// #endif

	init() {
		this.setPerspectiveCamera();
		this.cameraController.add(this);

		this.initialized.resolve();
	}

	setPerspectiveCamera() {
		this.instance = new PerspectiveCamera(75, store.aspect.ratio, 0.1, 1000);
		this.instance.rotation.reorder('YXZ');

		this.scene.add(this.instance);
	}

	resize() {
		this.instance.aspect = store.aspect.ratio;
		this.instance.updateProjectionMatrix();
	}

	update() {
		if (!this.initialized) return;

		this.instance.updateMatrixWorld();
	}
}

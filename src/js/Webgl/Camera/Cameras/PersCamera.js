import { PerspectiveCamera } from 'three';
import { imageAspect } from 'philbin-packages/maths';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';

let initialized = false;

export default class PersCamera {
	constructor(label = '', params = {}) {
		const webgl = getWebgl();
		this.scene = webgl.mainScene.instance;
		this.canvas = webgl.canvas;
		this.cameraController = webgl.cameraController;

		this.label = label;
		this.params = params;

		this.init();
	}

	init() {
		this.setPerspectiveCamera();
		this.cameraController.add(this);

		initialized = true;
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
		if (!initialized) return;

		this.instance.updateMatrixWorld();
	}
}

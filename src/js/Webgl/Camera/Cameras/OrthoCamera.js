import { OrthographicCamera, PerspectiveCamera } from 'three';
import { imageAspect } from 'philbin-packages/maths';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';

let initialized = false;

export default class OrthoCamera {
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
		this.setOrthographicCamera();
		this.cameraController.add(this);

		initialized = true;
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
		// If you want to keep the aspect of your image in a shader
		const aspect = 1 / 1; // Aspect of the displayed image
		const imgAspect = imageAspect(aspect, store.resolution.width, store.resolution.height);
		store.aspect.a1 = imgAspect.a1;
		store.aspect.a2 = imgAspect.a2;
	}

	update() {
		if (!initialized) return;

		this.instance.updateMatrixWorld();
	}
}

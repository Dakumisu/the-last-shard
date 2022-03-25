import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';
import { PerspectiveCamera } from 'three';

export default class MainCamera {
	constructor() {
		this.instance = new PerspectiveCamera(75, store.aspect.ratio, 0.5, 1000);
		this.instance.position.set(2, 3, 3);
		this.instance.lookAt(0, 0, 0);
		this.instance.rotation.reorder('YXZ');

		const webgl = getWebgl();
		webgl.scene.instance.add(this.instance);

		this.cameraController = webgl.cameraController;
	}

	resize() {
		this.cameraController.currentCamera.resize();

		this.instance.aspect = store.aspect.ratio;
		this.instance.updateProjectionMatrix();
	}

	update() {
		if (this.cameraController.currentCamera) {
			this.cameraController.currentCamera.update();
			this.instance.position.copy(this.cameraController.currentCamera.instance.position);
			this.instance.quaternion.copy(this.cameraController.currentCamera.instance.quaternion);
			this.instance.updateMatrixWorld();
		}
	}

	destroy() {}
}

import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';
import { PerspectiveCamera } from 'three';
import signal from 'philbin-packages/signal';

export default class MainCamera {
	constructor() {
		this.instance = new PerspectiveCamera(75, store.aspect.ratio, 0.5, 1000);
		this.instance.position.set(2, 3, 3);
		this.instance.lookAt(0, 0, 0);
		this.instance.rotation.reorder('YXZ');

		const webgl = getWebgl();
		webgl.mainScene.instance.add(this.instance);

		this.cameraController = webgl.cameraController;

		signal.on('keydown', (key) => {
			if (key === 'C') {
				console.log('📹 Cameras :', this.cameraController.cameras);
				console.log('📹 Current Camera :', this.cameraController.currentCamera);
				console.log('📹 Main Camera :', this);
			}
		});
	}

	resize() {
		this.cameraController.currentCamera.resize();

		this.instance.aspect = store.aspect.ratio;
		this.instance.updateProjectionMatrix();
	}

	update() {
		if (this.cameraController.currentCamera) {
			/// #if DEBUG
			if (
				this.cameraController.get('player') &&
				this.cameraController.currentCamera !== this.cameraController.get('player')
			) {
				this.cameraController.get('player').update();
				this.cameraController.currentCamera.update();
			} else this.cameraController.currentCamera.update();
			/// #endif
			/// #if !DEBUG
			this.cameraController.currentCamera.update();
			/// #endif
			this.instance.position.copy(this.cameraController.currentCamera.instance.position);
			this.instance.quaternion.copy(this.cameraController.currentCamera.instance.quaternion);
			this.instance.updateMatrixWorld();
		}
	}

	destroy() {}
}

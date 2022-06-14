import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';
import { PerspectiveCamera } from 'three';
import signal from 'philbin-packages/signal';

export default class MainCamera {
	constructor() {
		this.instance = new PerspectiveCamera(75, store.aspect.ratio, 0.5, 1000);
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
		this.instance.aspect = store.aspect.ratio;
		this.instance.updateProjectionMatrix();
	}

	update(et, dt) {
		if (this.cameraController.currentCamera) {
			/// #if DEBUG
			if (
				this.cameraController.get('player') &&
				this.cameraController.currentCamera !== this.cameraController.get('player')
			) {
				this.cameraController.get('player').update();
			}
			/// #endif

			this.cameraController.currentCamera.update(et, dt);

			this.instance.position.copy(this.cameraController.currentCamera.instance.position);
			this.instance.quaternion.copy(this.cameraController.currentCamera.instance.quaternion);
			this.instance.updateMatrixWorld();
		}
	}

	destroy() {}
}

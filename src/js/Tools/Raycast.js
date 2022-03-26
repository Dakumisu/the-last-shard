import signal from 'philbin-packages/signal';
import { Raycaster } from 'three';

import { getWebgl } from '@webgl/Webgl';

let initialized = false;

export default class Raycast {
	constructor(opt = {}) {
		const webgl = getWebgl();
		this.scene = webgl.mainScene.instance;
		this.mouse = webgl.mouse.scene;
		this.camera = webgl.camera.instance;

		this.objectsToRaycast = new Map();

		this.init();
	}

	init() {
		this.raycaster = new Raycaster();
		this.raycaster.firstHitOnly = true;
		this.raycaster.params.Points.threshold = 0.01; // ray' size

		initialized = true;
	}

	addMesh(label, mesh) {
		if (!this.objectsToRaycast.has(label)) {
			this.objectsToRaycast.set(label, mesh);
			return;
		}
		console.error('Mesh with this label already exists');
	}

	removeMesh(label) {
		if (this.objectsToRaycast.has(label)) {
			this.objectsToRaycast.delete(label);
			return;
		}
		console.error('Mesh with this label does not exist');
	}

	destroy() {
		if (!initialized) return;

		initialized = false;
	}

	update() {
		if (!initialized) return;

		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(
			Array.from(this.objectsToRaycast.values()),
			true,
		);

		for (let i = 0; i < intersects.length; i++) {
			signal.emit('raycast', intersects[i].object);
		}
	}
}

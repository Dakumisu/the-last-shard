import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import signal from 'philbin-packages/signal';
import { Mesh } from 'three';

export default class BaseObject {
	/**
	 *
	 * @param {{mesh: Mesh | null, name: string, isInteractable: boolean}} param0
	 */
	constructor({ mesh = null, name = '', isInteractable = false }) {
		this.base = {
			mesh,
			name,
			isInteractable,
		};

		if (this.base.isInteractable) {
			this.isInBroadphaseRange = false;
			signal.on('interact', this.interact.bind(this));
		}
	}

	interact(key) {
		if (this.isInBroadphaseRange) {
			if (this.base.mesh)
				this.base.mesh.material = new BaseBasicMaterial({ color: '#ff0000' });
			console.log('🎮 Interacting with :', this.base.name);
		}
	}
}

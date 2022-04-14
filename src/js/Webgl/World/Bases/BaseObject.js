import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import signal from 'philbin-packages/signal';

export default class BaseObject {
	constructor({ mesh = null, name = '', isInteractable = false } = {}) {
		this.base = {
			mesh,
			name,
			isInteractable,
		};

		if (this.base.isInteractable) {
			this.isInBroadphaseRange = false;
			signal.on('interact', this.#interact.bind(this));
		}
	}

	#interact() {
		if (this.isInBroadphaseRange) {
			if (this.base.mesh)
				this.base.mesh.material = new BaseBasicMaterial({ color: '#ff0000' });
			console.log('interact with :', this);
		}
	}
}

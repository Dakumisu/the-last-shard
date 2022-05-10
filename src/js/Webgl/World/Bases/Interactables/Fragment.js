import BaseCollider from '../BaseCollider';

export default class Fragment extends BaseCollider {
	constructor({ asset = null, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.initialized = true;
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		// this.base.mesh.geometry.dispose();
		// this.base.mesh.material.dispose();
		// this.base.mesh = null;

		console.log('interact with fragment');
	}

	update() {
		if (!this.initialized) return;
	}
}

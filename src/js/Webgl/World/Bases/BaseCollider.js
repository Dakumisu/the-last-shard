import BasePhysic from './BasePhysic';

let initialized = false;

const params = {};

export default class BaseCollider extends BasePhysic {
	constructor() {
		super();

		this.base = {};
	}

	update(et) {
		if (!initialized) return;
	}
}

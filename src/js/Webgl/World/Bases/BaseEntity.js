import BasePhysic from './BasePhysic';

let initialized = false;

export default class BaseEntity extends BasePhysic {
	constructor() {
		super();

		this.base = {};

		this.params = {
			gravity: -30,
		};
	}

	update(et) {
		if (!initialized) return;
	}
}

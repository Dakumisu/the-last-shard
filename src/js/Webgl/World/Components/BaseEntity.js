import BasePhysic from './BasePhysic';

let initialized = false;

const params = {
	gravity: -30,
};

export default class BaseEntity extends BasePhysic {
	constructor() {
		super();

		this.base = {};
	}

	update(et) {
		if (!initialized) return;
	}
}

import { Mesh } from 'three';
import BasePhysic from './BasePhysic';

let initialized = false;

export default class BaseCollider extends BasePhysic {
	constructor({ mesh = null, name = '', type = '' } = {}) {
		super({ mesh, name });

		this.base.type = type;
	}

	update(et) {
		if (!initialized) return;
	}
}

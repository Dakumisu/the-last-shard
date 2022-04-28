import BasePhysic from './BasePhysic';
import CollidersBroadphase from './Broadphase/CollidersBroadphase';

export default class BaseEntity extends BasePhysic {
	constructor({ name = '', isInteractable = false } = {}) {
		super({ name, isInteractable });

		this.broadphase = new CollidersBroadphase({ radius: 10 });

		this.params = {
			gravity: -30,
		};
	}
}

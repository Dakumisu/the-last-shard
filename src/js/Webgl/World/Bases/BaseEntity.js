import BasePhysic from './BasePhysic';
import CollidersBroadphase from './Broadphase/CollidersBroadphase';

export default class BaseEntity extends BasePhysic {
	constructor({ mesh = null, name = '', isInteractable = false } = {}) {
		super({ mesh, name, isInteractable });

		this.broadphase = new CollidersBroadphase({ radius: 5 });

		this.params = {
			gravity: -30,
		};
	}
}

import { Box3, Matrix4 } from 'three';
import BaseCollider from './BaseCollider';
import BasePhysic from './BasePhysic';
import CollidersBroadphase from './Broadphase/CollidersBroadphase';

export default class BaseEntity extends BasePhysic {
	constructor({ mesh = null, name = '' } = {}) {
		super({ mesh, name });

		this.broadphase = new CollidersBroadphase({ radius: 5 });

		this.params = {
			gravity: -30,
		};
	}
}

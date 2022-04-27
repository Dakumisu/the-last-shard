import { Mesh } from 'three';
import BasePhysic from './BasePhysic';

let initialized = false;

export default class BaseCollider extends BasePhysic {
	/**
	 *
	 * @param {{mesh: Mesh | null, name: String, type: 'nonWalkable' | 'walkable', isInteractable?: Boolean }} param0
	 */
	constructor({ mesh = null, name = '', type = 'nonWalkable', isInteractable = false }) {
		super({ mesh, name, isInteractable });

		this.base.type = type;
	}

	// update(et) {
	// 	if (!initialized) return;
	// }
}

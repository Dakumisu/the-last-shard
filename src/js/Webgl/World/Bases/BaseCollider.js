import { Mesh } from 'three';
import BasePhysic from './BasePhysic';

export default class BaseCollider extends BasePhysic {
	/**
	 *
	 * @param {{name: String, type: 'nonWalkable' | 'walkable', isInteractable?: Boolean }} param0
	 */
	constructor({ name = '', type = 'nonWalkable', isInteractable = false }) {
		super({ name, isInteractable });

		this.base.type = type;
	}
}

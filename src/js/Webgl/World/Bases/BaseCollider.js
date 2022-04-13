import { Mesh } from 'three';
import BasePhysic from './BasePhysic';

let initialized = false;

export default class BaseCollider extends BasePhysic {
	constructor({ name, type }) {
		super();
		this.name = name;
		this.type = type;
	}

	initPhysics(mesh, options = {}) {
		super.initPhysics(mesh, options);
		this.physicsMesh.name = this.name;
		this.physicsMesh.geometry.colliderType = this.type;
	}

	// addCollider(mesh) {
	// 	if (!(mesh instanceof Mesh)) {
	// 		console.error(`Mesh required ❌`);
	// 		return;
	// 	}
	// }

	// removeCollider(mesh) {
	// 	if (!(mesh instanceof Mesh)) {
	// 		console.error(`Mesh required ❌`);
	// 		return;
	// 	}
	// }

	update(et) {
		if (!initialized) return;
	}
}

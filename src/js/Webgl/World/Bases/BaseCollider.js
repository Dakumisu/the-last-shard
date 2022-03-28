import { Mesh } from 'three';
import BasePhysic from './BasePhysic';

let initialized = false;

export default class BaseCollider extends BasePhysic {
	constructor() {
		super();
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

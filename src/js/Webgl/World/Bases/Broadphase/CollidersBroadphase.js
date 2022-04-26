import BaseBroadphase from './BaseBroadphase';
import BaseCollider from '../BaseCollider';

export default class CollidersBroadphase extends BaseBroadphase {
	constructor({ radius = 5, objectsToTest = [] } = {}) {
		super({ radius, objectsToTest });
	}

	// Colliders
	setGroundCollider(object) {
		console.log(object);
		if (!(object instanceof BaseCollider)) {
			console.error(`Colliders required ❌`);
			return;
		}
		this.currentObjects = [];
		this.currentObjects.push(object.base);
	}

	setPropsColliders(objectsToTest = []) {
		if (!Array.isArray(objectsToTest)) {
			console.error(`Colliders array required ❌`);
			return;
		}
		this.objectsToTest = objectsToTest;
	}
}

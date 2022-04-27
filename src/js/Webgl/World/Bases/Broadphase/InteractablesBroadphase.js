import { Box3, Matrix4 } from 'three';
import BaseBroadphase from './BaseBroadphase';

const tBox3c = new Box3();
const tMat4b = new Matrix4();

export default class InteractablesBroadphase extends BaseBroadphase {
	constructor({ radius = 5, objectsToTest = [] } = {}) {
		super({ radius, objectsToTest });
	}

	add(object) {
		if (this.currentObjects[0] && this.currentObjects[0] !== object)
			this.remove(this.currentObjects[0]);
		super.add(object);
		if (object.isInteractable && !object.isInBroadphaseRange) {
			/// #if DEBUG
			console.log('🎮 Press F to interact');
			/// #endif
			object.isInBroadphaseRange = true;
		}
	}

	remove(object) {
		super.remove(object);
		if (object.isInteractable && object.isInBroadphaseRange) {
			/// #if DEBUG
			console.log('🎮 Out of range to interact');
			/// #endif
			object.isInBroadphaseRange = false;
		}
	}

	update(positionToTest) {
		let _d;
		let nearestObject;

		this.objectsToTest.forEach((object) => {
			tBox3c.makeEmpty();
			// temporary
			tBox3c.copy(object.children[0].geometry.boundingBox);
			tMat4b.copy(object.children[0].matrixWorld);
			tBox3c.applyMatrix4(tMat4b);

			const d = tBox3c.distanceToPoint(positionToTest);
			if (!_d) _d = d;

			// if previous distance is greater than current distance, save nearestObject
			if (d <= this.radius && d <= _d) nearestObject = object;
		});

		if (nearestObject) this.add(nearestObject);
		else if (this.currentObjects[0]) this.remove(this.currentObjects[0]);
	}
}

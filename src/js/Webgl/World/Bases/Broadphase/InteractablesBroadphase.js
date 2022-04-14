import { Box3, Matrix4 } from 'three';
import BaseBroadphase from './BaseBroadphase';

const tBox3c = new Box3();
const tMat4b = new Matrix4();

export default class InteractablesBroadphase extends BaseBroadphase {
	constructor({ radius = 5, objectsToTest = [] } = {}) {
		super({ radius, objectsToTest });
	}

	add(object) {
		this.currentObjects[0] = null;
		super.add(object);
		if (object.base.isInteractable && !object.isInBroadphaseRange) {
			/// #if DEBUG
			console.log('🎮 Press F to interact');
			/// #endif
			object.isInBroadphaseRange = true;
		}
	}

	remove(object) {
		super.remove(object);
		if (object.base.isInteractable && object.isInBroadphaseRange) {
			/// #if DEBUG
			console.log('🎮 Out of range to interact');
			/// #endif
			object.isInBroadphaseRange = false;
		}
	}

	update(positionToTest) {
		// Save previous distance
		let _d;

		this.objectsToTest.forEach((object) => {
			tBox3c.makeEmpty();
			tBox3c.copy(object.base.mesh.geometry.boundingBox);
			tMat4b.copy(object.base.mesh.matrixWorld);
			tBox3c.applyMatrix4(tMat4b);

			const d = tBox3c.distanceToPoint(positionToTest);
			if (!_d) _d = d;

			// if previous distance is greater than current distance, set current object as interactable
			if (d <= this.radius && d <= _d) {
				this.add(object);
			} else this.remove(object);
		});
		console.log(this.currentObjects.length);
	}
}

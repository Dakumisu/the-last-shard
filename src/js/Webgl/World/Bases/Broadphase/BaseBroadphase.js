import { Box3, Matrix4 } from 'three';

const tBox3c = new Box3();
const tMat4b = new Matrix4();

export default class BaseBroadphase {
	constructor({ radius = 5, objectsToTest = [] } = {}) {
		this.radius = radius;

		console.log(this.radius);

		this.objectsToTest = objectsToTest;

		this.currentObjects = [];
	}

	add(object) {
		if (!this.currentObjects.includes(object)) {
			this.currentObjects.push(object);
		}
	}

	remove(object) {
		if (this.currentObjects.indexOf(object) === -1) return;

		const index = this.currentObjects.indexOf(object);
		this.currentObjects.splice(index, 1);
	}

	update(positionToTest) {
		this.objectsToTest.forEach((object) => {
			tBox3c.makeEmpty();
			tBox3c.copy(object.base.mesh.geometry.boundingBox);
			tMat4b.copy(object.base.mesh.matrixWorld);
			tBox3c.applyMatrix4(tMat4b);

			const d = tBox3c.distanceToPoint(positionToTest);

			if (d <= this.radius) this.add(object);
			else this.remove(object);
		});
	}
}

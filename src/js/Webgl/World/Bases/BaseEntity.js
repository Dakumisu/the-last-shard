import { Box3, Matrix4 } from 'three';
import BaseCollider from './BaseCollider';
import BasePhysic from './BasePhysic';

const tBox3c = new Box3();
const tMat4b = new Matrix4();

const broadphaseRadius = 5;

export default class BaseEntity extends BasePhysic {
	constructor({ mesh = null, name = '' } = {}) {
		super({ mesh, name });

		this.colliders = [];
		this.collidersToTest = [];

		this.params = {
			gravity: -30,
		};
	}

	// Colliders
	setMainCollider(collider) {
		if (!(collider instanceof BaseCollider)) {
			console.error(`Collider required ❌`);
			return;
		}
		this.colliders = [];
		this.colliders.push(collider);
	}

	setPropsColliders(colliders = []) {
		if (!Array.isArray(colliders)) {
			console.error(`Colliders array required ❌`);
			return;
		}
		this.collidersToTest = colliders;
	}

	// Broadphase
	addColliderToBroadphase(collider) {
		if (!this.colliders.includes(collider)) this.colliders.push(collider);
	}

	removeColliderFromBroadphase(collider) {
		if (this.colliders.indexOf(collider) === -1) return;

		const id = this.colliders.indexOf(collider);
		this.colliders.splice(id, 1);
	}

	updateBroadphase(position) {
		this.collidersToTest.forEach((collider) => {
			tBox3c.makeEmpty();
			tBox3c.copy(collider.base.mesh.geometry.boundingBox);
			tMat4b.copy(collider.base.mesh.matrixWorld);
			tBox3c.applyMatrix4(tMat4b);

			const d = tBox3c.distanceToPoint(position);

			if (d <= broadphaseRadius) this.addColliderToBroadphase(collider);
			else this.removeColliderFromBroadphase(collider);
		});
	}
}

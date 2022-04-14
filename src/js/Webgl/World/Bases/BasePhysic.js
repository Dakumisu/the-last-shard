import { BufferGeometry, Mesh } from 'three';
import { acceleratedRaycast, MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';
import BaseObject from './BaseObject';

// Add the raycast function. Assumes the BVH is available on
// the `boundsTree` variable
Mesh.prototype.raycast = acceleratedRaycast;

export default class BasePhysic extends BaseObject {
	constructor({ mesh = null, name = '' } = {}) {
		super({ mesh, name });

		this.physicsInitialized = false;
	}

	/**
	 * @param {Object} options
	 */
	initPhysics(options = {}) {
		if (
			!this.base.mesh ||
			!this.base.mesh.geometry ||
			!(this.base.mesh.geometry instanceof BufferGeometry)
		) {
			console.error('Need geometry in Mesh, check if this.base.mesh exists');
			return null;
		}

		this.base.mesh.geometry.boundsTree = new MeshBVH(this.base.mesh.geometry, options);

		this.base.mesh.updateWorldMatrix(true, false);
		this.base.mesh.geometry.matrixWorld = this.base.mesh.matrixWorld;

		this.physicsInitialized = true;
	}

	/// #if DEBUG
	initPhysicsVisualizer(depth = 20) {
		if (!this.base.mesh || !(this.base.mesh instanceof Mesh)) {
			console.error('Need Mesh collider');
			return null;
		}
		this.physicsVisualizer = new MeshBVHVisualizer(this.base.mesh, depth);
	}
	/// #endif
}

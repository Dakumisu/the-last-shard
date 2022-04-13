import { BufferGeometry, Mesh } from 'three';
import { acceleratedRaycast, MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

// Add the raycast function. Assumes the BVH is available on
// the `boundsTree` variable
Mesh.prototype.raycast = acceleratedRaycast;

export default class {
	constructor() {
		this.physicsInitialized = false;
		this.physicsMesh = null;
	}

	/**
	 * @param {Mesh} mesh
	 * @param {Object} options
	 */
	initPhysics(mesh, options = {}) {
		this.physicsMesh = mesh;

		if (!this.physicsMesh.geometry || !(this.physicsMesh.geometry instanceof BufferGeometry)) {
			console.error('Need geometry');
			return null;
		}

		this.physicsMesh.geometry.boundsTree = new MeshBVH(this.physicsMesh.geometry, options);

		this.physicsMesh.updateWorldMatrix(true, false);
		this.physicsMesh.geometry.matrixWorld = this.physicsMesh.matrixWorld;

		this.physicsInitialized = true;
	}

	/// #if DEBUG
	initPhysicsVisualizer(depth = 20) {
		if (!this.physicsMesh || !(this.physicsMesh instanceof Mesh)) {
			console.error('Need Mesh collider');
			return null;
		}
		this.physicsVisualizer = new MeshBVHVisualizer(this.physicsMesh, depth);
	}
	/// #endif
}

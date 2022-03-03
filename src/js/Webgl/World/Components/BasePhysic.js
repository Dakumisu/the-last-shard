import { BufferGeometry, Mesh } from 'three';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import { getWebgl } from '@webgl/Webgl';

let initialized = false;

const params = {};

export default class BasePhysic {
	constructor() {
		this.base = {};
	}

	setPhysics(geometry, options = {}) {
		if (!geometry || !geometry instanceof BufferGeometry) {
			console.error('Need geometry');
			return null;
		}
		return new MeshBVH(geometry, options);
	}

	/// #if DEBUG
	setVisualizer(collider, depth = 20) {
		if (!collider || !collider instanceof Mesh) {
			console.error('Need collider');
			return null;
		}
		return new MeshBVHVisualizer(collider, depth);
	}
	/// #endif
}

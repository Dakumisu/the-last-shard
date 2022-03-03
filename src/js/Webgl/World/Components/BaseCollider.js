import { BufferGeometry, Mesh } from 'three';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import { getWebgl } from '@webgl/Webgl';

import mergeGeometry from '@utils/webgl/mergeBufferGeometries';

let initialized = false;

const params = {};

export default class BaseCollider {
	constructor() {
		this.base = {};
	}

	async mergeGeometries(geometries = null, models = null) {
		let g = [];
		let m = [];
		if (geometries) g = [geometries];
		if (models) m = [models];
		const geometry = await mergeGeometry(g, m);
		return geometry;
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

	update(et) {
		if (!initialized) return;
	}
}

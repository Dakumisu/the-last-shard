import {
	Color,
	Mesh,
	MeshNormalMaterial,
	MeshStandardMaterial,
	Vector2,
	Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import Webgl from '@js/Webgl/Webgl';

import { store } from '@js/Tools/Store';

const twoPI = Math.PI * 2;
const tVec3 = new Vector3();
const tVec2 = new Vector2();
const tCol = new Color();

let initialized = false;

const params = {
	color: '#ffffff',
};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Character',
};
/// #endif

export default class Character {
	constructor(opt = {}) {
		const webgl = new Webgl();
		this.scene = webgl.scene;

		this.object = {};

		this.setGeometry();
		this.setMaterial();
		this.setMesh();

		this.resize();

		initialized = true;

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
		/// #endif
	}

	/// #if DEBUG
	debug() {}
	/// #endif

	setGeometry() {
		this.object.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);
	}

	setMaterial() {
		this.object.material = new MeshNormalMaterial();
	}

	setMesh() {
		this.object.mesh = new Mesh(this.object.geometry, this.object.material);

		this.scene.add(this.object.mesh);
	}

	resize() {
		if (!initialized) return;

		tVec3.set(
			store.resolution.width,
			store.resolution.height,
			store.resolution.dpr,
		);
	}

	update(et) {
		if (!initialized) return;
	}
}

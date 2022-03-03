import {
	Box3,
	BoxHelper,
	Color,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import { getWebgl } from '@webgl/Webgl';

import { store } from '@tools/Store';
import loadModel from '@utils/loader/loadGLTF';

import sandbox from '/assets/model/sandbox.glb';

const twoPI = Math.PI * 2;
const tVec2 = new Vector2();
const tCol = new Color();

let initialized = false;

const params = {};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Character',
};
/// #endif

export default class Character {
	constructor(opt = {}) {
		const webgl = getWebgl();
		this.scene = webgl.scene.instance;
		this.camera = webgl.camera.instance;

		this.object = {};

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
		/// #endif
	}

	/// #if DEBUG
	debug() {}
	/// #endif

	async init() {
		await this.setCharater();

		initialized = true;
	}

	async setCharater() {
		this.setGeometry();
		this.setMaterial();
		this.setMesh();
	}

	setGeometry() {
		this.object.geometry = new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5);
	}

	setMaterial() {
		this.object.material = new MeshNormalMaterial();
	}

	setMesh() {
		this.object.mesh = new Mesh(this.object.geometry, this.object.material);

		console.log(this.object.geometry);
		this.object.geometry.computeBoundingBox();
		const playerBox = this.object.geometry.boundingBox;

		// console.log(playerBox);
		this.object.mesh.position.set(0, playerBox.max.y, 30);

		this.helperBox = new BoxHelper(this.object.mesh, 0xffff00);
		this.scene.add(this.object.mesh);
		this.scene.add(this.helperBox);
	}

	resize() {
		if (!initialized) return;
	}

	update(et) {
		if (!initialized) return;

		this.camera.lookAt(this.object.mesh.position);

		this.helperBox.position.copy(this.object.mesh.position);
	}
}

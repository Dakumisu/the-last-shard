import { Color, DoubleSide, GridHelper, Mesh, MeshNormalMaterial } from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseCollider from '../Components/BaseCollider';

import mergeGeometry from '@utils/webgl/mergeBufferGeometries';
import { store } from '@tools/Store';

// import sandbox from '/assets/model/sandbox.glb';
const sandbox = '/assets/model/sandbox.glb';
const twoPI = Math.PI * 2;

let initialized = false;

const params = {};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Character',
};
/// #endif

export default class Ground extends BaseCollider {
	constructor() {
		super();

		const webgl = getWebgl();
		this.scene = webgl.scene.instance;

		this.base = {};

		this.init();

		/// #if DEBUG
		debug.instance = webgl.debug;
		this.debug();
		this.helpers();
		/// #endif
	}

	/// #if DEBUG
	debug() {}

	helpers() {
		const size = 150;
		const divisions = 40;
		const colorCenterLine = new Color('#f00');
		const gridHelper = new GridHelper(size, divisions, colorCenterLine);

		gridHelper.position.x = 40;
		gridHelper.position.z = -30;
		this.scene.add(gridHelper);
	}
	/// #endif

	async init() {
		await this.setGround();

		initialized = true;
	}

	async setGround() {
		this.base.geometry = await mergeGeometry([], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
		this.base.material = new MeshNormalMaterial({ side: DoubleSide });
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.scene.add(this.base.mesh);

		/// #if DEBUG
		const v = this.setVisualizer(this.base.mesh, 30);
		this.scene.add(v);
		/// #endif
	}

	resize() {
		if (!initialized) return;
	}

	update(et) {
		if (!initialized) return;
	}
}

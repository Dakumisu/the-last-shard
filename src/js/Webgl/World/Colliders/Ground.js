import {
	Clock,
	Color,
	DoubleSide,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	PlaneBufferGeometry,
	UniformsUtils,
} from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseCollider from '../Components/BaseCollider';

import { mergeGeometry } from '@utils/webgl';
import { store } from '@tools/Store';
import debugMaterial from '../materials/debug/material';
import fogMaterial from '../materials/fog/material';

// import sandbox from '/assets/model/sandbox.glb';
const sandbox = '/assets/model/sandbox.glb';
const twoPI = Math.PI * 2;

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Ground',
};
/// #endif

export default class Ground extends BaseCollider {
	constructor() {
		super();

		const webgl = getWebgl();
		this.scene = webgl.scene.instance;

		this.base = {};

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	helpers() {
		this.visualizer = this.setVisualizer(this.base.mesh, 30);
		this.scene.add(this.visualizer);

		const size = 150;
		const divisions = 40;
		const colorCenterLine = new Color('#f00');
		const gridHelper = new GridHelper(size, divisions, colorCenterLine);

		gridHelper.position.x = 40;
		gridHelper.position.z = -30;
		this.scene.add(gridHelper);
	}

	debug() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		gui.addButton({ title: 'bvh' }).on('click', () => {
			this.visualizer.visible = !this.visualizer.visible;
		});
	}
	/// #endif

	async init() {
		await this.setGround();

		/// #if DEBUG
		this.debug();
		this.helpers();
		/// #endif

		initialized = true;
	}

	async setGround() {
		this.base.geometry = await mergeGeometry([], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);

		this.base.material = fogMaterial.get();
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.add(this.base.mesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

import {
	Clock,
	Color,
	DoubleSide,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	PlaneBufferGeometry,
	PlaneGeometry,
	UniformsUtils,
} from 'three';

import { getWebgl } from '@webgl/Webgl';
import BaseCollider from '../Components/BaseCollider';

import { mergeGeometry } from '@utils/webgl';
import { store } from '@tools/Store';
import debugMaterial from '../materials/debug/material';
import { CustomMeshBasicMaterial } from '../materials/CustomMeshBasicMaterial/Material';
import { CustomMeshToonMaterial } from '../materials/CustomMeshToonMaterial/Material';
import { CustomMeshStandardMaterial } from '../materials/CustomMeshStandardMaterial/Material';

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
		gridHelper.position.y = -0.8;
		this.scene.add(gridHelper);
	}

	debug() {
		debug.instance.setFolder(debug.label);
		const gui = debug.instance.getFolder(debug.label);

		gui.addButton({ title: 'bvh' }).on('click', () => {
			console.log('oe');
			this.visualizer.visible = !this.visualizer.visible;
		});
	}
	/// #endif

	async init() {
		await this.setGround();

		/// #if DEBUG
		this.helpers();
		this.debug();
		/// #endif

		initialized = true;
	}

	async setGround() {
		const g = new PlaneGeometry(200, 200);
		g.rotateX(-Math.PI * 0.5);

		this.base.geometry = await mergeGeometry([g], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);

		// this.base.material = fogMaterial.get();
		this.base.material = new CustomMeshToonMaterial({
			side: DoubleSide,
			uniforms: {
				diffuse: { value: new Color('#d29ddc') },
			},
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.base.mesh.position.y = -1;
		this.scene.add(this.base.mesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

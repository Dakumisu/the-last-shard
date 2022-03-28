import { BoxGeometry, Color, DoubleSide, GridHelper, Mesh, PlaneGeometry } from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseCollider from '@webgl/World/Bases/BaseCollider';

const sandbox = '/assets/model/collinetest.glb';
const twoPI = Math.PI * 2;

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Ground',
};
/// #endif

export default class Ground extends BaseCollider {
	constructor(scene) {
		super();

		this.scene = scene.instance;

		this.base = {};

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	/// #if DEBUG
	helpers() {
		this.visualizer = this.setVisualizer(this.base.mesh, 30);
		this.visualizer.visible = false;
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
		const gui = debug.instance.addFolder({ title: debug.label });

		gui.addButton({ title: 'bvh' }).on('click', () => {
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
		const planeGeo = new PlaneGeometry(200, 200);
		planeGeo.rotateX(-Math.PI * 0.5);
		planeGeo.translate(0, -1, 0);
		const cubeGeo = new BoxGeometry(10, 10, 10);
		this.base.geometry = await mergeGeometry([planeGeo, cubeGeo], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
		// this.addCollider(this.base.mesh);

		this.base.material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#d29ddc'),
		});

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

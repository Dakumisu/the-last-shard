import { BoxGeometry, Color, DoubleSide, GridHelper, Mesh, PlaneGeometry } from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseCollider from '@webgl/World/Bases/BaseCollider';

const sandbox = '/assets/model/cabane.glb';
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
		super({ name: 'Map', type: 'walkable' });

		this.scene = scene.instance;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	/// #if DEBUG
	helpers() {
		this.initPhysicsVisualizer(30);
		this.physicsVisualizer.visible = false;
		this.scene.add(this.physicsVisualizer);

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

		gui.addInput(this.physicsVisualizer, 'visible', { label: 'BVH' });
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
		const geometry = await mergeGeometry([planeGeo, cubeGeo], [sandbox]);

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#d29ddc'),
		});

		const mesh = new Mesh(geometry, material);

		const geoOpt = {
			lazyGeneration: false,
		};

		this.initPhysics(mesh, geoOpt);

		this.scene.add(this.physicsMesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

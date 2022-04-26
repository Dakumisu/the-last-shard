import {
	BoxGeometry,
	Color,
	DoubleSide,
	GridHelper,
	MathUtils,
	Matrix4,
	Mesh,
	MeshNormalMaterial,
	PlaneGeometry,
	SphereGeometry,
} from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseCollider from '@webgl/World/Bases/BaseCollider';
import { loadGLTF } from '@utils/loaders/loadStaticGLTF';
import { loadModels } from '@utils/loaders/loadAssets';

const sandbox = '/assets/export/Scene_Sandbox.glb';
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
		this.manifest = scene.manifest;
		this.label = scene.label;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	async init() {
		await this.setGround();

		/// #if DEBUG
		this.helpers();
		this.devtool();
		/// #endif

		initialized = true;
	}

	async loadGeometry() {
		const base = await loadModels('Scene_' + this.label);

		const baseMerged = await mergeGeometry([base], []);

		return { base, baseMerged };
	}

	async setGround() {
		const { base, baseMerged } = await this.loadGeometry();

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#4e4b37'),
		});

		this.base.mesh = new Mesh(baseMerged);

		// console.log(this.base.meshGround);
		// this.base.meshGround = base;
		// this.base.meshGround.material = new MeshNormalMaterial();

		// this.scene.add(this.base.meshGround);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.initPhysics(geoOpt);
	}

	/// #if DEBUG
	helpers() {
		this.initPhysicsVisualizer(30);
		this.physicsVisualizer.visible = true;
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

	devtool() {
		const gui = debug.instance.addFolder({ title: debug.label });

		gui.addInput(this.physicsVisualizer, 'visible', { label: 'BVH' });
	}
	/// #endif

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

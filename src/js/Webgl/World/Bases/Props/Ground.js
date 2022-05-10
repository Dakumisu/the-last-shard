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
	Cache,
} from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import BaseCollider from '@webgl/World/Bases/BaseCollider';
import { loadGLTF } from '@utils/loaders/loadStaticGLTF';
import { loadModel } from '@utils/loaders/loadAssets';
import { Group } from 'three';
import { wait } from 'philbin-packages/async';
import { loadDynamicGLTF } from '@utils/loaders';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';

Cache.enabled = true;

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
		this.label = scene.label;

		this.colliders = [];

		this.instance = new Group();

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	async init() {
		await this.loadGround();

		/// #if DEBUG
		this.helpers();
		this.devtool();
		/// #endif

		initialized = true;

		this.scene.add(this.instance);
	}

	async loadGround() {
		const _asset = '/assets/export/Scene_' + this.label + '.glb';
		const model = (await loadDynamicGLTF(_asset)).scene;

		const base = model.children.find((m) => m.name.includes('SceneBase'));

		this.base.realMesh = base;

		const material = new BaseBasicMaterial({
			// side: DoubleSide,
			color: new Color('#664CB1'),
		});

		model.traverse((obj) => {
			if (obj.material) obj.material = material;
		});

		this.instance.add(base);

		// cloning issue with the model
		const baseMerged = await mergeGeometry([], [_asset]);

		this.base.mesh = new Mesh(baseMerged);
		this.colliders.push(this.base);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.initPhysics(geoOpt);
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

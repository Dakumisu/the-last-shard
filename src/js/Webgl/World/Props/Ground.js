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
		const _asset = 'Scene_' + this.label;
		const model = await loadModel(_asset.toLowerCase());

		const base = model.children.find((m) => m.name.includes('SceneBase'));

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#4e4b37'),
		});

		model.traverse((obj) => {
			if (obj.material) obj.material = material;
		});

		this.instance.add(base);

		// cloning issue with the model
		const modelToMergePath = '/assets/export/' + _asset + '.glb';
		const baseMerged = await mergeGeometry([], [modelToMergePath]);

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

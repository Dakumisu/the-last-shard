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
import { loadStaticGLTF } from '@utils/loaders';

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
	constructor(scene) {
		super({ name: 'Map', type: 'walkable' });

		this.scene = scene.instance;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	async init() {
		await this.setGround();

		/// #if DEBUG
		this.helpers();
		this.debug();
		/// #endif

		initialized = true;
	}

	async setGround() {
		let testPlatform = new Mesh(new BoxGeometry(10, 0.5, 10), new MeshNormalMaterial());
		testPlatform.position.set(20, 3, 20);

		let secondTestPlatform = new Mesh(new BoxGeometry(10, 0.5, 10), new MeshNormalMaterial());
		secondTestPlatform.position.set(-20, 3, 20);

		let aTestPlatform = new Mesh(new BoxGeometry(10, 0.5, 10), new MeshNormalMaterial());
		aTestPlatform.position.set(-10, 3, -10);

		let bTestPlatform = new Mesh(new BoxGeometry(10, 0.5, 10), new MeshNormalMaterial());
		bTestPlatform.position.set(3, 3, -20);

		const plane = new PlaneGeometry(200, 200);
		plane.rotateX(-Math.PI * 0.5);
		plane.translate(0, -1, 0);

		let platforms = await mergeGeometry(
			[secondTestPlatform, testPlatform, aTestPlatform, bTestPlatform],
			[],
		);

		const geometry = await mergeGeometry([plane, platforms], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#4e4b37'),
		});

		this.base.mesh = new Mesh(geometry, material);

		this.initPhysics(geoOpt);

		this.scene.add(this.base.mesh);
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

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

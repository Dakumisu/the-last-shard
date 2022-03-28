import {
	BoxGeometry,
	Color,
	DoubleSide,
	GridHelper,
	Matrix4,
	Mesh,
	MeshNormalMaterial,
	PlaneGeometry,
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
		const plane = new PlaneGeometry(200, 200);
		plane.rotateX(-Math.PI * 0.5);
		plane.translate(0, -1, 0);
		this.base.geometry = await mergeGeometry([plane], [sandbox]);

		const geoOpt = {
			lazyGeneration: false,
		};
		this.base.geometry.boundsTree = this.setPhysics(this.base.geometry, geoOpt);
		this.base.geometry.name = 'Map';
		this.base.geometry.colliderType = 'walkable';

		this.base.material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#4e4b37'),
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);

		this.scene.add(this.base.mesh);

		const mat4 = new Matrix4();

		this.testCube = new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial());
		this.testCube.name = 'cube1';
		this.testCube.position.set(2, 1, 12);
		this.testCube.flag = 'collider';
		this.testCube.geometry.colliderType = 'nonWalkable';
		this.testCube.geometry.boundsTree = this.setPhysics(this.testCube.geometry, geoOpt);
		this.testCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(this.testCube.matrixWorld, this.testCube.matrix);
		this.testCube.geometry.matrixWorld = this.testCube.matrixWorld;

		this.secondTestCube = new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial());
		this.secondTestCube.flag = 'collider';
		this.secondTestCube.geometry.colliderType = 'nonWalkable';
		this.secondTestCube.name = 'cube2';
		this.secondTestCube.position.set(-6, 1, 12);
		this.secondTestCube.geometry.boundsTree = this.setPhysics(
			this.secondTestCube.geometry,
			geoOpt,
		);
		this.secondTestCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(this.secondTestCube.matrixWorld, this.secondTestCube.matrix);
		this.secondTestCube.geometry.matrixWorld = this.secondTestCube.matrixWorld;
		this.scene.add(this.secondTestCube);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

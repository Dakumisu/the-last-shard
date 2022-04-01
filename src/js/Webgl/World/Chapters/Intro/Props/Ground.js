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
		super();

		this.scene = scene.instance;

		this.base = {};
		this.colliders = [];

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

		this.base.geometry = await mergeGeometry([plane, platforms], [sandbox]);

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

		/// #if DEBUG
		const mat4 = new Matrix4();

		let testCube = new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial());
		testCube.name = 'cube1';
		testCube.position.set(2, 1, 12);
		testCube.flag = 'collider';
		testCube.geometry.colliderType = 'nonWalkable';
		testCube.geometry.boundsTree = this.setPhysics(testCube.geometry, geoOpt);
		testCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(testCube.matrixWorld, testCube.matrix);
		testCube.geometry.matrixWorld = testCube.matrixWorld;

		this.colliders.push(testCube);

		testCube = new Mesh(new BoxGeometry(3, 20, 3), new MeshNormalMaterial());
		testCube.flag = 'collider';
		testCube.geometry.colliderType = 'nonWalkable';
		testCube.name = 'cube2';
		testCube.position.set(-6, 1, 12);
		testCube.geometry.boundsTree = this.setPhysics(testCube.geometry, geoOpt);
		testCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(testCube.matrixWorld, testCube.matrix);
		testCube.geometry.matrixWorld = testCube.matrixWorld;

		this.colliders.push(testCube);

		testCube = new Mesh(new BoxGeometry(3, 30, 3), new MeshNormalMaterial());
		testCube.flag = 'collider';
		testCube.geometry.colliderType = 'nonWalkable';
		testCube.name = 'cube3';
		testCube.position.set(-3, 1, -20);
		testCube.geometry.boundsTree = this.setPhysics(testCube.geometry, geoOpt);
		testCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(testCube.matrixWorld, testCube.matrix);
		testCube.geometry.matrixWorld = testCube.matrixWorld;

		this.colliders.push(testCube);

		testCube = new Mesh(new SphereGeometry(3, 30, 30), new MeshNormalMaterial());
		testCube.flag = 'collider';
		testCube.geometry.colliderType = 'nonWalkable';
		testCube.name = 'cube4';
		testCube.position.set(-10, 1, 20);
		testCube.geometry.boundsTree = this.setPhysics(testCube.geometry, geoOpt);
		testCube.updateWorldMatrix(true, false);
		mat4.multiplyMatrices(testCube.matrixWorld, testCube.matrix);
		testCube.geometry.matrixWorld = testCube.matrixWorld;

		this.colliders.push(testCube);
		/// #endif
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

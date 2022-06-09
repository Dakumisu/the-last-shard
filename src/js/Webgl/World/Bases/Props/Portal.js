import PortalMaterial from '@webgl/Materials/Portal/PortalMaterial';
import BaseObject from '../BaseObject';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import {
	Box3,
	Box3Helper,
	BoxBufferGeometry,
	Color,
	Matrix4,
	Mesh,
	SphereGeometry,
	Vector3,
} from 'three';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';

const TEMP_POS = new Vector3();
const TEMP_BOX = new Box3();
const TEMP_MAT = new Matrix4();

export default class Portal extends BaseObject {
	constructor(
		scene,
		{
			name = '',
			isInteractable = false,
			isMovable = false,
			isRawMesh = true,
			asset = null,
			group = null,
		},
	) {
		super({
			name,
			isInteractable,
			isMovable,
			isRawMesh,
			asset,
			group,
		});

		this.scene = scene;
		this.isEnter = false;
		this.innerPortal = null;
		this.outerPortal = null;
	}

	async init() {
		await super.init();
		this.listener();
	}

	async loadAsset() {
		await super.loadAsset();

		// this.base.mesh.updateWorldMatrix(true, true);

		this.base.mesh.traverse((child) => {
			if (child.name.includes('portal')) {
				this.innerPortal = child;
				child.material = PortalMaterial.use();
			} else if (child.type === 'Mesh') {
				this.outerPortal = child;
				this.outerPortal.updateWorldMatrix(true, true);
				// this.outerPortal.updateMatrix();
				this.outerPortal.geometry.computeBoundingBox();
				console.log(this.outerPortal);
			}
		});

		this.portalPos = this.base.mesh.position;
		// this.innerPortal.geometry.boundingSphere.center;
		// this.innerPortal.localToWorld(this.portalPos);
		// console.log(this.portalPos);
		// console.log(this.innerPortal);
		// this.base.mesh.computeBoundingBox();
		// this.base.mesh.updateMatrixWorld(true);
		// this.bbox = new Box3().setFromObject(this.base.mesh);
		// console.log(this.bbox.getSize(TEMP_POS));
		// // this.radius = this.innerPortal.geometry.boundingSphere.radius;

		// this.base.mesh.updateMatrixWorld(true);
		TEMP_BOX.makeEmpty();
		TEMP_BOX.copy(this.outerPortal.geometry.boundingBox);
		TEMP_MAT.copy(this.base.mesh.matrixWorld);
		TEMP_BOX.applyMatrix4(TEMP_MAT);

		console.log(TEMP_BOX);

		const helper = new Box3Helper(TEMP_BOX, 0xffff00);
		this.scene.instance.add(helper);
	}

	listener() {
		signal.on('scene:complete', () => {
			this.isEnter = false;
		});
	}

	async update(playerPos) {
		if (!this.initialized) return;
		if (this.isEnter) return;

		// TEMP_POS.copy(playerPos);
		// let { x, y, z } = TEMP_POS.sub(this.portalPos);

		// const d = TEMP_BOX.distanceToPoint(playerPos);

		const isIn = TEMP_BOX.containsPoint(playerPos);
		// console.log(isIn);

		// x = Math.abs(x);
		// z = Math.abs(z);
		// // const test = this.bbox.distanceToPoint(playerPos);
		// console.log(x, y, z);

		// console.log(d);

		// if (d < 2.2) {
		// 	console.log('enter');
		// 	// this.isEnter = true;
		// 	// signal.emit('portal:enter', this.scene.label);
		// 	// signal.emit('scene:switch', this.base.asset.params.destination || 'lobby');
		// }
	}
}

import BaseObject from '../BaseObject';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import {
	Box3,
	Box3Helper,
	BoxBufferGeometry,
	Color,
	DoubleSide,
	Matrix4,
	Mesh,
	SphereGeometry,
	Vector3,
} from 'three';
import LeavesMaterial from '@webgl/Materials/Leaves/LeavesMaterial';

export default class Tree extends BaseObject {
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
		this.leaves = null;
	}

	async init() {
		await super.init();
	}

	async loadAsset() {
		await super.loadAsset();

		this.base.material = LeavesMaterial.use();

		this.base.mesh.traverse((child) => {
			if (child.name.includes('leaves')) {
				this.leaves = child;
				child.material = this.base.material;
			}
		});
	}

	async update() {
		if (!this.initialized) return;
	}
}

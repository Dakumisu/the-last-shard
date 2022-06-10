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
	}

	async init() {
		await super.init();
		this.listener();
	}

	async loadAsset() {
		await super.loadAsset();

		this.base.mesh.updateWorldMatrix(true, true);

		this.base.mesh.traverse((child) => {
			if (child.name.includes('portal')) {
				this.innerPortal = child;
				child.material = PortalMaterial.use();
			}
		});
	}

	listener() {
		signal.on('scene:complete', () => {
			this.isEnter = false;
		});
	}

	async update(playerPos) {
		if (!this.initialized) return;
		if (this.isEnter) return;

		TEMP_POS.copy(playerPos);
		const distance = TEMP_POS.distanceTo(this.base.mesh.position);
		const sub = TEMP_POS.subVectors(playerPos, this.base.mesh.position);

		let limit = sub.y < 3 ? 2 : 5;
		if (distance < limit) {
			console.log('enter');
			this.isEnter = true;
			signal.emit('portal:enter', this.scene.label);
			signal.emit('scene:switch', this.base.asset.params.destination || 'lobby');
		}
	}
}

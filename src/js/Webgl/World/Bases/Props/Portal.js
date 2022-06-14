import PortalMaterial from '@webgl/Materials/Portal/PortalMaterial';
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
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { loadTexture } from '@utils/loaders';

const TEMP_POS = new Vector3();
const TRIGGER_POS = new Vector3();
const TEMP_BOX = new Box3();
const TEMP_MAT = new Matrix4();

const UP_VECTOR = new Vector3(0, -1, 0);

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
		await this.soundController.add('portal-ambient', {
			loop: true,
			pos: this.base.mesh.position,
		});
		await super.loadAsset();

		this.base.mesh.updateWorldMatrix(true, true);

		this.base.material = new PortalMaterial({
			side: DoubleSide,
			uniforms: {
				uColor: { value: new Color(0x8277ff) },
				uColor2: { value: new Color(0x31d7ff) },
				uTexture: { value: await loadTexture('portalTexture') },
				uTexture2: { value: await loadTexture('portalTexture2') },
				uTextureMask: { value: await loadTexture('portalTextureMask') },
			},
		});

		this.base.mesh.traverse((child) => {
			if (child.name.includes('portal')) {
				this.innerPortal = child;
				child.material = this.base.material;
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
		TRIGGER_POS.copy(this.base.mesh.position).add(UP_VECTOR);
		const distance = TEMP_POS.distanceTo(TRIGGER_POS);
		const sub = TEMP_POS.subVectors(playerPos, TRIGGER_POS);

		let limit = sub.y < 3 ? 2.5 : 4;
		if (distance < limit) {
			console.log('enter');
			this.isEnter = true;
			signal.emit('portal:enter', this.scene.label);
			signal.emit('scene:switch', this.base.asset.params.destination || 'lobby');
		}
	}
}

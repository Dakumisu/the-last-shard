import { loadModel, loadTexture } from '@utils/loaders/loadAssets';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import signal from 'philbin-packages/signal';
import { Color, Group, Object3D, RepeatWrapping, ShaderMaterial } from 'three';
import { DoubleSide } from 'three';
import { Mesh } from 'three';
import anime from 'animejs';
import { BaseShaderMaterial } from '@webgl/Materials/BaseMaterials/shader/material';
import ObjectMaterial from '@webgl/Materials/Objects/ObjectMaterial';
import { throttle } from 'philbin-packages/async';

export default class BaseObject {
	/**
	 *
	 * @param {{name?: string, isInteractable: boolean, isMovable: boolean, isRawMesh: boolean, asset?: Object, group?: Group}} param0
	 */
	constructor({
		name = '',
		isInteractable = false,
		isMovable = false,
		isRawMesh = false,
		asset = null,
		group = null,
	}) {
		this.base = {
			mesh: null,
			name,
			isInteractable,
			isMovable,
			isRawMesh,
			asset,
			group,
		};

		this.initialized = false;

		if (this.base.isInteractable) {
			this.isInBroadphaseRange = false;

			signal.on('user:interact', this.interact.bind(this));
		}
	}

	async init() {
		if (this.base.asset) await this.loadAsset();

		this.initialized = true;
	}

	async loadAsset() {
		if (!this.base.asset) {
			console.log('No Asset');
			return;
		}

		const { asset, movable, transforms, type, traversable } = this.base.asset;

		const model = await loadModel(asset);

		const material = ObjectMaterial.use();

		model.traverse((obj) => {
			if (obj.material) obj.material = material;

			if (obj.geometry) obj.geometry.computeBoundingBox();

			if (obj.userData.name) {
				if (obj.userData.name.includes('RawMesh')) {
					this.base.mesh = obj;
					this.base.isRawMesh = true;
				}
			}
			if (obj.isMesh && !this.base.isRawMesh) this.base.mesh = obj;
		});

		if (!this.base.mesh) return;

		this.base.mesh.position.fromArray(transforms.pos);
		this.base.mesh.quaternion.fromArray(transforms.qt);
		this.base.mesh.scale.setScalar(0.00001);
		this.base.mesh.name = asset;
		this.base.name = asset;
		this.base.mesh.isInteractable = this.base.isInteractable;
		this.base.mesh.isMovable = this.base.isMovable = movable;

		this.base.mesh.matrixAutoUpdate = false;

		if (this.base.isInteractable) this.base.mesh.userData.interact = this.base.asset.effect;

		this.base.mesh.traversable = traversable;
		this.base.group.add(this.base.mesh);

		this.show();
	}

	show() {
		const { scale } = this.base.asset.transforms;
		this.base.mesh.matrixAutoUpdate = true;
		// this.base.mesh.updateMatrix();
		anime({
			targets: this.base.mesh.scale,
			easing: 'spring(1, 190, 10, 1)',
			duration: 1000,
			x: [0.00001, scale[0]],
			y: [0.00001, scale[1]],
			z: [0.00001, scale[2]],
			begin: () => {
				this.base.mesh.matrixAutoUpdate = true;
			},
			complete: () => {
				this.base.mesh.matrixAutoUpdate = false;
				this.base.mesh.updateMatrix();
			},
		});
	}

	hide() {
		anime({
			targets: this.base.mesh.scale,
			easing: 'spring(1, 190, 10, 1)',
			duration: 1000,
			x: ['', 0.001],
			y: ['', 0.001],
			z: ['', 0.001],
			begin: () => {
				this.base.mesh.matrixAutoUpdate = true;
			},
			complete: () => {
				this.base.mesh.matrixAutoUpdate = false;
				this.base.mesh.updateMatrix();
			},
		});
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		if (this.base.mesh) this.base.mesh.material = new BaseBasicMaterial({ color: '#ff0000' });
		console.log('🎮 Interacting with :', this.base.name);
	}
}

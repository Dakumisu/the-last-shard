import { loadModel } from '@utils/loaders/loadAssets';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import signal from 'philbin-packages/signal';
import { Color, Group, Object3D } from 'three';
import { DoubleSide } from 'three';
import { Mesh } from 'three';
import anime from 'animejs';

export default class BaseObject {
	/**
	 *
	 * @param {{name?: string, isInteractable: boolean, asset?: Object, group?: Group}} param0
	 */
	constructor({ name = '', isInteractable = false, asset = null, group = null }) {
		this.base = {
			mesh: null,
			name,
			isInteractable,
			isRawMesh: false,
			asset,
			group,
		};

		if (this.base.isInteractable) {
			this.isInBroadphaseRange = false;
			signal.on('interact', this.interact.bind(this));
		}
	}

	async init() {
		if (this.base.asset) await this.loadAsset();
	}

	async loadAsset() {
		if (!this.base.asset) {
			console.log('No Asset');
			return;
		}

		const { asset, transforms, type, traversable } = this.base.asset;

		let _model = await loadModel(asset);

		// define material in function of the type of the object
		const materials = {};
		materials.collider = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#ED4646'),
		});
		materials.interactable = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#224646'),
		});

		_model.traverse((obj) => {
			if (obj.material)
				obj.material = this.base.isInteractable
					? materials.interactable
					: materials.collider;

			if (obj.geometry) obj.geometry.computeBoundingBox();

			if (obj.userData.name) {
				if (obj.userData.name.includes('RawMesh')) {
					this.base.mesh = obj;
					this.base.isRawMesh = true;
				}
			}
			if (obj.isMesh && !this.base.isRawMesh) this.base.mesh = obj;
		});

		// console.log('🎮 Loaded :', asset, this.base.mesh);

		if (!this.base.mesh) return;

		this.base.mesh.position.fromArray(transforms.pos);
		this.base.mesh.quaternion.fromArray(transforms.qt);
		this.base.mesh.scale.setScalar(0.00001);
		this.base.mesh.name = asset;
		this.base.name = asset;
		this.base.mesh.isInteractable = this.base.isInteractable;

		if (this.base.isInteractable) this.base.mesh.userData.interact = this.base.asset.effect;

		this.base.mesh.traversable = traversable;
		this.base.group.add(this.base.mesh);

		this.show();
	}

	show() {
		const { scale } = this.base.asset.transforms;
		anime({
			targets: this.base.mesh.scale,
			easing: 'spring(1, 190, 10, 1)',
			duration: 1000,
			x: [0.00001, scale[0]],
			y: [0.00001, scale[1]],
			z: [0.00001, scale[2]],
			complete: () => {
				if (!this.base.isInteractable) {
					this.base.mesh.matrixAutoUpdate = false;
					this.base.mesh.updateMatrix();
				}
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
		});
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;

		if (this.base.mesh) this.base.mesh.material = new BaseBasicMaterial({ color: '#ff0000' });
		console.log('🎮 Interacting with :', this.base.name);
	}
}

import anime from 'animejs';
import { deferredPromise } from 'philbin-packages/async';
import { Color, Vector3 } from 'three';
import { DoubleSide, Quaternion } from 'three';

import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import { loadModel } from '@utils/loaders/loadAssets';

const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Interactables {
	constructor({ interactable, group }) {
		this.group = group;
		this.interactable = interactable;

		this.initialized = deferredPromise();

		this.init();
	}

	async init() {
		await this.loadInteractable();

		this.initialized.resolve(true);
	}

	async loadInteractable() {
		if (!this.interactable) {
			console.log('No Asset');
			return;
		}

		let model = null;

		const { asset, transforms, type, traversable, effect } = this.interactable;

		const _asset = 'Asset_' + asset;
		const _model = await loadModel(_asset.toLowerCase());
		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#ED4646'),
		});

		_model.traverse((obj) => {
			if (obj.material) obj.material = material;
			// TODO: get bounding box from blender
			// ça prend sur le perf
			if (obj.geometry) obj.geometry.computeBoundingBox();
			if (obj.isMesh) model = obj;
		});

		if (!model) return;

		model.position.fromArray(transforms.pos);
		model.quaternion.fromArray(transforms.qt);
		model.scale.setScalar(0.00001);
		model.name = asset;
		model.isInteractable = true;

		model.propType = type;
		model.traversable = traversable;
		this.group.add(model);

		anime({
			targets: model.scale,
			easing: 'spring(1, 190, 10, 1)',
			duration: 1000,
			x: [0.00001, transforms.scale[0]],
			y: [0.00001, transforms.scale[1]],
			z: [0.00001, transforms.scale[2]],
		});
	}

	collect() {
		console.log(`⭐️ ${asset} collected !`);
	}

	getAsset(label) {
		return label;
	}

	update(et, dt) {
		if (!this.initialized) return;
	}
}

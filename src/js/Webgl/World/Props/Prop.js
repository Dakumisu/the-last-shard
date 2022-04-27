import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { Group } from 'three';
import { beziersPath, catmullPath } from '@utils/webgl/blenderCurves';
import { LineBasicMaterial } from 'three';
import { Line } from 'three';
import { BufferGeometry } from 'three';
import { loadModel } from '@utils/loaders/loadAssets';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { DoubleSide } from 'three';
import anime from 'animejs';
import { deferredPromise } from 'philbin-packages/async';

const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Props {
	constructor({ prop, group }) {
		this.group = group;
		this.prop = prop;

		this.initialized = deferredPromise();

		this.init();
	}

	async init() {
		await this.loadProp();

		this.initialized.resolve(true);
	}

	async loadProp() {
		if (!this.prop) {
			console.log('No Asset');
			return;
		}

		const { asset, transforms, type, traversable } = this.prop;

		const _asset = 'Asset_' + asset;
		const model = await loadModel(_asset.toLowerCase());

		const material = new BaseToonMaterial({
			side: DoubleSide,
			color: new Color('#ED4646'),
		});

		model.traverse((obj) => {
			if (obj.material) obj.material = material;
		});

		model.position.fromArray(transforms.pos);
		model.quaternion.fromArray(transforms.qt);
		model.scale.setScalar(0.00001);
		model.name = asset;

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

	update(et, dt) {
		if (!this.initialized) return;
	}
}

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

const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Interactables {
	constructor({ interactables = [], scene }) {
		this.scene = scene;

		this.interactables = interactables || [];
		this.instance = new Group();

		this.initialized = false;
	}

	async init() {
		await this.loadInteractables();

		this.initialized = true;

		this.scene.instance.add(this.instance);
	}

	async loadInteractables() {
		if (!this.interactables.length) {
			console.log('No Assets');
			return;
		}

		console.log(this.interactables);

		await this.interactables.forEach(async (prop) => {
			const _asset = 'Asset_' + prop.asset;
			const model = await loadModel(_asset.toLowerCase());
			const material = new BaseToonMaterial({
				side: DoubleSide,
				color: new Color('#ED4646'),
			});
			model.traverse((obj) => {
				if (obj.material) obj.material = material;
			});
			model.position.fromArray(prop.transforms.pos);
			model.quaternion.fromArray(prop.transforms.qt);
			model.scale.setScalar(0.00001);

			model.propType = prop.type;
			model.traversable = prop.traversable;
			// console.log(_asset, model);
			this.instance.add(model);

			anime({
				targets: model.scale,
				easing: 'spring(1, 190, 10, 1)',
				duration: 1000,
				x: [0.00001, prop.transforms.scale[0]],
				y: [0.00001, prop.transforms.scale[1]],
				z: [0.00001, prop.transforms.scale[2]],
			});
		});
	}

	getAsset(label) {
		return label;
	}

	update(et, dt) {
		if (!this.initialized) return;
	}
}

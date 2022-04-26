import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { Group } from 'three';
import { beziersPath, catmullPath } from '@utils/webgl/blenderCurves';
import { LineBasicMaterial } from 'three';
import { Line } from 'three';
import { BufferGeometry } from 'three';
import { loadModels } from '@utils/loaders/loadAssets';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';
import { DoubleSide } from 'three';

const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Interactables {
	constructor({ interactables = [], scene }) {
		this.scene = scene;

		this.interactables = interactables || [];
		this.group = new Group();

		this.initialized = false;
	}

	async init() {
		await this.loadInteractables();

		this.initialized = true;

		/// #if DEBUG
		this.scene.instance.add(this.group);
		/// #endif
	}

	async loadInteractables() {
		if (!this.interactables.length) {
			console.log('No Assets');
			return;
		}

		console.log(this.interactables);

		await this.interactables.forEach(async (prop) => {
			const _asset = prop.asset;
			const model = await loadModels('Asset_' + _asset);
			const material = new BaseToonMaterial({
				side: DoubleSide,
				color: new Color('#4e4b37'),
			});
			model.traverse((obj) => {
				if (obj.material) obj.material = material;
			});
			model.position.fromArray(prop.transforms.pos);
			model.quaternion.fromArray(prop.transforms.qt);
			model.scale.fromArray(prop.transforms.scale);
			model.propType = prop.type;
			model.traversable = prop.traversable;
			console.log(_asset, model);
			this.group.add(model);
		});
	}

	getAsset(label) {
		return label;
	}

	update(et, dt) {
		if (!this.initialized) return;
	}
}

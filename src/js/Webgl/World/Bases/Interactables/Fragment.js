import { getDom } from '@dom/Dom';
import { getGame } from '@game/Game';
import { store } from '@tools/Store';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import FragmentMaterial from '@webgl/Materials/Fragment/FragmentMaterial';
import { dampPrecise } from 'philbin-packages/maths';
import { AdditiveBlending, Color, DoubleSide, IcosahedronGeometry, Mesh, Vector3 } from 'three';
import BaseCollider from '../BaseCollider';
import signal from 'philbin-packages/signal';
import { loadTexture } from '@utils/loaders';
import AuraMaterial from '@webgl/Materials/AuraMaterial/AuraMaterial';

const params = {
	speed: 1,
	floatHeight: 0.25,
};

let dom;
let game;

export default class Fragment extends BaseCollider {
	constructor({ asset = null, group }) {
		super({ type: 'nonWalkable', isInteractable: true });

		this.base.asset = asset;
		this.base.group = group;
		this.autoUpdate = true;

		this.progress = 1;
		this.intensity = 0.5;
		this.isCollected = false;

		dom = getDom();
		game = getGame();

		this.initialized = false;
	}

	async init() {
		await super.init();

		this.material = new FragmentMaterial({
			transparent: true,
			uniforms: {
				uProgress: { value: this.progress },
				uShard: { value: await loadTexture('shardTexture') },
				uShard2: { value: await loadTexture('shardTexture2') },
				uMask: { value: await loadTexture('portalTextureMask') },
				uNoise: { value: await loadTexture('noiseTexture2') },
			},
		});

		this.base.mesh.traverse((obj) => {
			if (obj.material) {
				obj.material = this.material;
			}
		});

		this.base.auraMaterial = new AuraMaterial({
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
			uniforms: {
				uColor: { value: new Color(0x31d7ff) },
				uIntensity: { value: this.intensity },
				uRadius: { value: 0.005 },
			},
		});

		this.base.auraGeom = new IcosahedronGeometry(1.5, 3);
		this.base.auraMesh = new Mesh(this.base.auraGeom, this.base.auraMaterial);
		// this.base.auraMesh.frustumCulled = false;

		this.base.mesh.add(this.base.auraMesh);

		this.defaultPosY = this.base.asset.transforms.pos[1];
		this.TARGET_POS_Y = this.defaultPosY;

		this.initialized = true;
	}

	interact(key) {
		if (!this.isInBroadphaseRange) return;
		if (this.isCollected) return;

		signal.emit('sound:play', 'fragment-interact', {});

		this.isCollected = true;
		store.game.fragmentsCollected++;
		dom.nodes.domElements['fragment_count'].innerHTML = `${store.game.fragmentsCollected}`;
		game.save('fragments', store.game.fragmentsCollected);

		this.progress = 0;
		this.intensity = 4;

		console.log('interact with fragment');
	}

	float(et) {
		let time = et * 0.001;

		this.TARGET_POS_Y =
			this.defaultPosY + 0.5 + Math.sin(time * params.speed) * 0.15 + params.floatHeight;

		return this;
	}

	dampPosition(dt, factor) {
		// this.base.mesh.position.x = dampPrecise(
		// 	this.base.mesh.position.x,
		// 	this.TARGET_POS.x,
		// 	factor,
		// 	dt,
		// 	0.001,
		// );

		this.base.mesh.position.y = dampPrecise(
			this.base.mesh.position.y,
			this.TARGET_POS_Y,
			factor,
			dt,
			0.001,
		);

		// this.base.mesh.position.z = dampPrecise(
		// 	this.base.mesh.position.z,
		// 	this.TARGET_POS.z,
		// 	factor,
		// 	dt,
		// 	0.001,
		// );
	}

	update(et, dt) {
		if (!this.initialized) return;

		this.float(et).dampPosition(dt, 0.1);

		this.material.uniforms.uProgress.value = dampPrecise(
			this.material.uniforms.uProgress.value,
			this.progress,
			0.029,
			dt,
		);
		this.base.auraMaterial.uniforms.uIntensity.value = dampPrecise(
			this.base.auraMaterial.uniforms.uIntensity.value,
			this.intensity,
			0.029,
			dt,
		);
		this.base.auraMaterial.opacity = dampPrecise(
			this.base.auraMaterial.opacity,
			this.progress,
			0.029,
			dt,
		);
	}
}

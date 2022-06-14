import BaseScene from '@webgl/Scene/BaseScene';
import {
	DoubleSide,
	CylinderGeometry,
	AdditiveBlending,
	MeshBasicMaterial,
	IcosahedronGeometry,
} from 'three';
import { loadTexture } from '@utils/loaders';
import { LaserMaterialInner } from '@webgl/Materials/Laser/inner/material';
import { LaserMaterialOuter } from '@webgl/Materials/Laser/outer/material';
import { getPet } from '@webgl/World/Characters/Pet';
import signal from 'philbin-packages/signal';
import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';

export default class LaserGame {
	static laserMaterialInner;
	static laserMaterialOuter;
	static laserGeometry = new CylinderGeometry(0.1, 0.1, 1, 8, 32, true)
		.rotateZ(Math.PI * 0.5)
		.rotateY(Math.PI * 0.5)
		.translate(0, 0, 0.5);
	static sphereGeometry = new IcosahedronGeometry(0.2, 3);
	/**
	 *
	 * @param {{scene: BaseScene, id: number}} param0
	 */
	constructor({ scene, id }) {
		this.laserTowers = [];
		this.scene = scene;
		this.id = id;
		this.pet = getPet();

		signal.on('dialog:open', () => this.reset());

		this.init();
	}

	endEvent() {
		signal.emit(this.scene.label + ':endGame', this.id);
		console.log(this.scene.label + ':endGame', '🕹 Game ended');
	}

	revertEndEvent() {
		signal.emit(this.scene.label + ':endGameReverse', this.id);
		console.log('🕹 Game end reverted');
	}

	async init() {
		const texture = await loadTexture('laserTexture');

		if (!LaserGame.laserMaterialInner && !LaserGame.laserMaterialOuter) {
			LaserGame.laserMaterialInner = new LaserMaterialInner({
				transparent: true,
				side: DoubleSide,
				uniforms: {
					uTexture: { value: texture },
					uTimeIntensity: { value: 0.0012 },
				},
			});

			LaserGame.laserMaterialOuter = new LaserMaterialOuter({
				transparent: true,
				side: DoubleSide,
				blending: AdditiveBlending,
				uniforms: {
					uTimeIntensity: { value: 0.0012 },
				},
			});
		}

		this.laserGeometry = LaserGame.laserGeometry;
		this.laserMaterialInner = LaserGame.laserMaterialInner;
		this.laserMaterialOuter = LaserGame.laserMaterialOuter;
		// this.laserMaterial.defines.USE_TANGENT = ''
	}

	reset() {
		this.laserTowers.find((laserTower) => laserTower.type == 'start').desactivate();
	}

	update(et, dt) {
		this.laserTowers.forEach((laserTower) => laserTower.update(et, dt));
	}
}

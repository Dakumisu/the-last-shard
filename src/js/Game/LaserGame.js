import BaseScene from '@webgl/Scene/BaseScene';
import { DoubleSide, CylinderGeometry, AdditiveBlending } from 'three';
import { loadTexture } from '@utils/loaders';
import { LaserMaterialInner } from '@webgl/Materials/Laser/inner/material';
import { LaserMaterialOuter } from '@webgl/Materials/Laser/outer/material';
import { getPet } from '@webgl/World/Characters/Pet';
import signal from 'philbin-packages/signal';

export default class LaserGame {
	static laserMaterialInner;
	static laserMaterialOuter;
	static laserGeometry = new CylinderGeometry(0.1, 0.1, 1, 256, 256, true)
		.rotateZ(Math.PI * 0.5)
		.rotateY(Math.PI * 0.5)
		.translate(0, 2, 0.5);

	/**
	 *
	 * @param {{scene: BaseScene, id: number}} param0
	 */
	constructor({ scene, id }) {
		this.laserTowers = [];
		this.scene = scene;
		this.id = id;
		this.pet = getPet();

		this.init();
	}

	endEvent() {
		this.laserTowers.forEach((tower) => {
			tower.base.isInteractable = false;
		});
		signal.emit(this.scene.label + ':endGame', this.id);
		console.log('🕹 Game ended');
	}

	async init() {
		const texture = await loadTexture('laserTexture');

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

		this.laserGeometry = LaserGame.laserGeometry;
		this.laserMaterialInner = LaserGame.laserMaterialInner;
		this.laserMaterialOuter = LaserGame.laserMaterialOuter;
		// this.laserMaterial.defines.USE_TANGENT = ''
	}
}

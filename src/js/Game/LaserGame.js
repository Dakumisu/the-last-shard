import BaseScene from '@webgl/Scene/BaseScene';
import { DoubleSide, CylinderGeometry, AdditiveBlending } from 'three';
import { loadTexture } from '@utils/loaders';
import { LaserMaterialInner } from '@webgl/Materials/Laser/inner/material';
import { LaserMaterialOuter } from '@webgl/Materials/Laser/outer/material';

export default class LaserGame {
	static laserMaterialInner;
	static laserMaterialOuter;
	static laserGeometry = new CylinderGeometry(0.1, 0.1, 1, 256, 256, true)
		.rotateZ(Math.PI / 2)
		.rotateY(Math.PI / 2)
		.translate(0, 2, 0.5);

	/**
	 *
	 * @param {{scene: BaseScene}} param0
	 */
	constructor({ scene }) {
		this.laserTowers = [];
		this.scene = scene;

		this.init();
	}

	endEvent() {
		this.laserTowers.forEach((tower) => {
			tower.base.isInteractable = false;
		});
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

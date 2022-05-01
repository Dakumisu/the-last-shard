import BaseScene from '@webgl/Scene/BaseScene';
import {
	BufferGeometry,
	CatmullRomCurve3,
	Mesh,
	TubeGeometry,
	Vector3,
	TextureLoader,
	RepeatWrapping,
	MirroredRepeatWrapping,
	DoubleSide,
	CylinderGeometry,
} from 'three';
import { loadTexture } from '@utils/loaders';
import { LaserMaterial } from '@webgl/Materials/Laser/material';

export default class LaserGame {
	static laserMaterial;
	static laserGeometry = new CylinderGeometry(0.05, 0.05, 1, 20, 5, false)
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
		if (!LaserGame.laserMaterial) {
			const texture = await loadTexture('laserTexture');
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;

			LaserGame.laserMaterial = new LaserMaterial({
				transparent: true,
				side: DoubleSide,
				uniforms: {
					uTexture: { value: texture },
				},
			});
		}
		this.laserMaterial = LaserGame.laserMaterial;
		this.laserGeometry = LaserGame.laserGeometry;
	}
}

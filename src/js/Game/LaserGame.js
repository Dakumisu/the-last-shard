import { LaserMaterial } from '@webgl/Materials/Laser/material';
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
} from 'three';
import { loadTexture } from '@utils/loaders';

export default class LaserGame {
	/**
	 *
	 * @param {{scene: BaseScene}} param0
	 */
	constructor({ scene }) {
		this.laserTowers = [];
		this.scene = scene;

		this.init();
	}

	async init() {
		const texture = await loadTexture('laserTexture');
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;

		const lineMaterial = new LaserMaterial({
			transparent: true,
			side: DoubleSide,
			uniforms: {
				uTexture: { value: texture },
			},
		});

		this.maxDistancePoint = new Vector3();

		this.curve = new CatmullRomCurve3([this.maxDistancePoint], false, 'catmullrom', 0);

		this.dummyGeo = new BufferGeometry();

		this.lineMesh = new Mesh(this.dummyGeo, lineMaterial);
		this.lineMesh.position.y += 1.3;

		this.scene.instance.add(this.lineMesh);
		// this.lineMesh.scale.set(2, 2, 2);
	}

	/**
	 *
	 * @param {Vector3} point
	 */
	async addPointToGeometry(point, end = false) {
		this.curve.points[this.curve.points.length - 1] = point;
		if (!end) this.curve.points.push(this.maxDistancePoint);
		// this.updateGeometry();
	}

	async removePointFromGeometry(point) {
		this.curve.points.splice(this.curve.points.indexOf(point), 1);
		if (!this.curve.points.includes(this.maxDistancePoint))
			this.curve.points.push(this.maxDistancePoint);
		// this.updateGeometry();
	}

	async updateMaxDistancePoint(point) {
		this.maxDistancePoint.copy(point);
		this.updateGeometry();
	}

	updateGeometry() {
		this.lineMesh.geometry =
			this.curve.points.length > 1
				? new TubeGeometry(this.curve, 30, 0.05, 30, false)
				: this.dummyGeo;
	}
}

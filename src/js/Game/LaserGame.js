import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { BaseShaderMaterial } from '@webgl/Materials/BaseMaterials/shader/material';
import { LaserMaterial } from '@webgl/Materials/Laser/material';
import BaseScene from '@webgl/Scene/BaseScene';
import LaserTower from '@webgl/World/Bases/Props/LaserTower';
import { wait } from 'philbin-packages/async';
import {
	BufferGeometry,
	CatmullRomCurve3,
	DoubleSide,
	Line,
	LineBasicMaterial,
	Mesh,
	ShaderMaterial,
	TubeGeometry,
	Vector3,
} from 'three';

export default class LaserGame {
	/**
	 *
	 * @param {{scene: BaseScene}} param0
	 */
	constructor({ scene }) {
		this.laserTowers = [];
		this.scene = scene;

		const lineMaterial = new LaserMaterial({});

		this.maxDistancePoint = new Vector3();

		this.curve = new CatmullRomCurve3([this.maxDistancePoint], false, 'catmullrom', 0);

		this.dummyGeo = new BufferGeometry();

		this.lineMesh = new Mesh(this.dummyGeo, lineMaterial);
		this.lineMesh.position.y += 1.5;

		this.scene.instance.add(this.lineMesh);
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
				? new TubeGeometry(this.curve, 20, 0.05, 10, false)
				: this.dummyGeo;
	}
}

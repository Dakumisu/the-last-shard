import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import BaseScene from '@webgl/Scene/BaseScene';
import LaserTower from '@webgl/World/Bases/Props/LaserTower';
import { BufferGeometry, DoubleSide, Line, LineBasicMaterial, Vector3 } from 'three';

export default class LaserGame {
	/**
	 *
	 * @param {{laserTowers: Array<LaserTower>, scene: BaseScene}} param0
	 */
	constructor({ laserTowers = [], scene }) {
		this.laserTowers = laserTowers;
		this.scene = scene;

		const lineMaterial = new BaseBasicMaterial({
			color: 0xffff00,
			side: DoubleSide,
		});

		this.maxDistancePoint = new Vector3();

		this.linePoints = [this.maxDistancePoint];
		const lineGeometry = new BufferGeometry();

		this.lineMesh = new Line(lineGeometry, lineMaterial);
		this.lineMesh.position.y += 1.5;
		this.lineMesh.frustumCulled = false;
		this.scene.instance.add(this.lineMesh);
	}

	/**
	 *
	 * @param {Vector3} point
	 */
	addPointToGeometry(point, end) {
		this.linePoints[this.linePoints.length - 1] = point;
		if (!end) this.linePoints.push(this.maxDistancePoint);
		this.updateGeometry();
	}

	removePointFromGeometry(point) {
		this.linePoints.splice(this.linePoints.indexOf(point), 1);
		if (!this.linePoints.includes(this.maxDistancePoint))
			this.linePoints.push(this.maxDistancePoint);
		this.updateGeometry();
	}

	updateGeometry() {
		this.lineMesh.geometry.setFromPoints(this.linePoints);
	}
}

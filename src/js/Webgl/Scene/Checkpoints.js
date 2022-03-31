import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry } from 'three';

export default class Checkpoints {
	constructor({ points = [], scene }) {
		this.scene = scene;

		this.points = points;
		this.checkpointsIndex = 1;
		this.isInside = false;

		this.initialized = false;

		if (this.points.length > 1) this.init();
	}

	init() {
		this.initialized = true;
		this.checkpointMesh = new Mesh(
			new SphereGeometry(2, 16, 16),
			new BaseBasicMaterial({ color: new Color('red'), wireframe: true }),
		);
		this.checkpointMesh.position.fromArray(this.points[1]);
		this.scene.instance.add(this.checkpointMesh);
	}

	getCurrent() {
		// console.log('getCurrent', this.points[this.checkpointsIndex]);
		return this.points[this.checkpointsIndex - 1];
	}

	update(et, dt) {
		if (this.initialized && this.checkpointsIndex !== this.points.length) {
			const inRange =
				this.scene.player.base.mesh.position.distanceTo(this.checkpointMesh.position) < 2;

			if (!this.isInside && inRange) {
				this.isInside = true;

				this.checkpointsIndex++;
				console.log('checkpoint', this.checkpointsIndex);

				if (this.points[this.checkpointsIndex]) {
					// Tp mesh to next checkpoint to collide
					this.checkpointMesh.position.fromArray(this.points[this.checkpointsIndex]);
				} else {
					console.log('last checkpoint');
				}
			} else if (!inRange && this.isInside) {
				console.log('not inside');
				this.isInside = false;
			}
		}
	}
}

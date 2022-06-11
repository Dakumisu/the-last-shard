import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import { Color, Mesh, SphereGeometry, Vector3 } from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';

const radius = 2;
const tVec3 = new Vector3();
const tQuat = new Quaternion();

export default class Checkpoints {
	constructor({ points = [], scene }) {
		this.player = getPlayer();

		this.scene = scene;

		this.list = [];
		points.forEach((point) => {
			const cp = new Checkpoint(point);
			this.list.push(cp);
			this.scene.instance.add(cp.mesh);
		});

		this.currentCheckpoint = this.list[0];

		this.isInside = false;
		this.initialized = true;
	}

	update(et, dt) {
		if (!this.initialized || this.list.length === 1) return;

		if (!this.isInside)
			this.list.forEach((cp) => {
				const inRange = this.player.base.mesh.position.distanceTo(cp.pos) < radius;

				if (inRange && cp !== this.currentCheckpoint) {
					this.isInside = true;
					this.currentCheckpoint = cp;

					/// #if DEBUG
					console.log('👊 Checkpoint reached');
					/// #endif
					this.player.setCheckpoint(this.currentCheckpoint);

					signal.emit('sound:play', 'checkpoint');
				} else if (!inRange && this.isInside) this.isInside = false;
			});
		else this.isInside = false;
	}
}

class Checkpoint {
	static geometry = new SphereGeometry(radius, 16, 16);
	static material = new BaseBasicMaterial({ color: new Color('red'), wireframe: true });
	constructor({ pos, qt }) {
		this.pos = pos;
		this.qt = qt;

		this.mesh = new Mesh(Checkpoint.geometry, Checkpoint.material);
		this.mesh.position.copy(this.pos);
		this.mesh.quaternion.copy(this.qt);

		// this.mesh.visible = false;
	}
}

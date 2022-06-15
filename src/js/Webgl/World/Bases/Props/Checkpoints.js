import { BaseBasicMaterial } from '@webgl/Materials/BaseMaterials/basic/material';
import {
	AdditiveBlending,
	BoxGeometry,
	Color,
	CylinderGeometry,
	DoubleSide,
	Group,
	Mesh,
	SphereGeometry,
	Vector3,
} from 'three';
import signal from 'philbin-packages/signal';
import { Quaternion } from 'three';
import { getPlayer } from '@webgl/World/Characters/Player';
import CheckpointMaterial from '@webgl/Materials/CheckpointMaterial/CheckpointMaterial';
import anime from 'animejs';
import CheckpointMaterialInner from '@webgl/Materials/CheckpointMaterialInner/CheckpointMaterialInner';
import { loadTexture } from '@utils/loaders';

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
			this.scene.instance.add(cp.group);
		});

		this.currentCheckpoint = this.list[0];
		this.currentCheckpoint.material.uniforms.uTransition.value = 1;

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
					anime({
						targets: this.currentCheckpoint.material.uniforms.uTransition,
						value: 0,
						duration: 500,
						easing: 'easeInOutQuad',
					});

					this.currentCheckpoint = cp;

					anime({
						targets: this.currentCheckpoint.material.uniforms.uTransition,
						value: 1,
						duration: 500,
						easing: 'easeInOutQuad',
					});

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
	static geometry = new CylinderGeometry(0.75, 0.75, 0.45, 64, 64, true);
	constructor({ pos, qt }) {
		this.pos = pos;
		this.qt = qt;

		this.material = new CheckpointMaterial({
			transparent: true,
			blending: AdditiveBlending,
			depthWrite: false,
			side: DoubleSide,
			uniforms: {
				uColor1: { value: new Color(0x000000) },
				uColor2: { value: new Color(0xffffff) },
				uTransition: { value: 0 },
			},
		});
		this.materialInner = new CheckpointMaterialInner({
			transparent: true,
			blending: AdditiveBlending,
			side: DoubleSide,
			uniforms: {
				uColor1: { value: new Color(0x31d7ff) },
				uColor2: { value: new Color(0x5f0892) },
				uTransition: { value: 0 },
			},
		});

		this.mesh = new Mesh(Checkpoint.geometry, this.material);
		this.meshInner = new Mesh(Checkpoint.geometry, this.materialInner);
		this.meshInner.scale.set(0.9, 0.9, 0.9);
		this.meshInner.position.y = -0.5;

		this.group = new Group();
		this.group.add(this.meshInner);

		this.group.position.copy(this.pos);
		this.group.position.y = 1;
		this.group.quaternion.copy(this.qt);
	}
}

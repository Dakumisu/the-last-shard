import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	Mesh,
	PlaneGeometry,
	RepeatWrapping,
	ShaderMaterial,
	TextureLoader,
	Vector3,
} from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';
import { map, mean } from 'philbin-packages/maths';

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

const params = {
	width: 1,
	height: 1,
	heightVariation: 0.7,
	vertexNumber: 3,
	offset: 0.1,
};

const cloudTexture = new TextureLoader().load('/assets/image/cloud.jpg');
cloudTexture.wrapS = cloudTexture.wrapT = RepeatWrapping;

export default class Grass {
	constructor(scene) {
		this.scene = scene.instance;
		this.player = scene.player;

		this.base = {};

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif
	}

	/// #if DEBUG

	devtool() {
		const gui = debug.instance.addFolder({ title: debug.label });
	}
	/// #endif

	async init() {
		await this.setGrass();

		/// #if DEBUG
		this.devtool();
		/// #endif

		initialized = true;
	}

	async setGrass() {
		console.log(this.scene);

		this.charaPos = new Vector3();
		// console.log(this.player.base.mesh.position);

		const geometry = new GrassGeometry(25, 1000);
		this.base.material = new ShaderMaterial({
			uniforms: {
				uCloud: { value: 0 },
				uTime: { value: 0 },
				uCharaPos: { value: this.charaPos },
				uHalfBoxSize: { value: 10 },
			},
			transparent: true,
			vertexShader,
			fragmentShader,
		});

		this.base.mesh = new Mesh(geometry, this.base.material);
		this.base.mesh.frustumCulled = false;

		this.scene.add(this.base.mesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		this.base.material.uniforms.uTime.value = et;

		this.charaPos.copy(this.player.base.mesh.position);

		// this.base.mesh.quaternion.copy(this.player.base.mesh.quaternion);
	}
}

class GrassGeometry extends BufferGeometry {
	constructor(size, count) {
		super();

		const positions = [];
		const Ipos = [];
		const uvs = [];
		const indices = [];

		for (let i = 0; i < count; i++) {
			const surfaceMin = (size / 2) * -1;
			const surfaceMax = size / 2;
			const radius = (size / 2) * Math.random();
			const theta = Math.random() * 2 * Math.PI;

			// const x = radius * Math.cos(theta) * 2;
			// const y = radius * Math.sin(theta) * 2;
			const x = Math.random() * size - size * 0.5;
			const y = Math.random() * size - size * 0.5;

			uvs.push(
				...Array.from({ length: params.vertexNumber }).flatMap(() => [
					map(x, surfaceMin, surfaceMax, 0, 1),
					map(y, surfaceMin, surfaceMax, 0, 1),
				]),
			);

			const blade = this.computeBlade([x, 0, y], i);
			positions.push(...blade.positions);
			indices.push(...blade.indices);

			// console.log(blade);
		}

		const vertices = new Float32Array([
			-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0,
			-1.0, 1.0,
		]);

		const tVec3a = new Vector3();

		const posMean = [];

		for (let i = 0; i < positions.length; i++) {
			if (i % 9 === 0) {
				tVec3a.set(positions[i], positions[i + 1], positions[i + 2]);

				// bl
				posMean[i] = tVec3a.x; // x
				posMean[i + 1] = tVec3a.y; // y
				posMean[i + 2] = tVec3a.z; // z

				// br
				posMean[i + 3] = tVec3a.x; // x
				posMean[i + 4] = tVec3a.y; // y
				posMean[i + 5] = tVec3a.z; // z

				// tc
				posMean[i + 6] = tVec3a.x; // x
				posMean[i + 7] = tVec3a.y; // y
				posMean[i + 8] = tVec3a.z; // z
			}
		}

		for (let i = 0; i < Ipos.length; i++) {}

		// itemSize = 3 because there are 3 values (components) per vertex
		this.setAttribute('aPosition', new BufferAttribute(new Float32Array(positions), 3));
		this.setAttribute('aPositionI', new BufferAttribute(new Float32Array(Ipos), 3));
		this.setAttribute('aPositionMean', new BufferAttribute(new Float32Array(posMean), 3));
		this.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
		// this.setAttribute('normal', new BufferAttribute(new Float32Array(positions), 3));
		this.setIndex(indices);
		this.computeVertexNormals();
	}

	computeBlade(center, index = 0) {
		// const height = params.height + Math.random() * params.heightVariation;
		const height = params.height;
		const vIndex = index * params.vertexNumber;

		const yawVec = [-1, 0, 0];
		const bendVec = [0, 0, 0];

		// Calc bottom, middle, and tip vertices
		const bl = yawVec.map((n, i) => n * (params.width / 2) * 1 + center[i]);
		const br = yawVec.map((n, i) => n * (params.width / 2) * -0.5 + center[i]);
		// const tl = yawVec.map((n, i) => n * (params.width / 4) * 1 + center[i]);
		// const tr = yawVec.map((n, i) => n * (params.width / 4) * -1 + center[i]);
		const tc = bendVec.map((n, i) => n + center[i]);

		// Attenuate height
		// tl[1] += height / 2;
		// tr[1] += height / 2;
		tc[1] += height;

		return {
			positions: [...bl, ...br, ...tc],
			indices: [
				vIndex,
				vIndex + 1,
				vIndex + 2,
				// vIndex + 2,
				// vIndex + 4,
				// vIndex + 3,
				// vIndex + 3,
				// vIndex,
				// vIndex + 2,
			],
		};
	}
}

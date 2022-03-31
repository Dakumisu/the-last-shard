import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	RepeatWrapping,
	ShaderMaterial,
	TextureLoader,
	Vector3,
} from 'three';

import { loadTexture } from '@utils/loaders/loadAssets';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';

let initialized = false;

const params = {
	halfBoxSize: 28,
	verticeScale: 0.42,
	count: 200000,
};

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

export default class Grass {
	constructor(scene) {
		this.scene = scene.instance;
		this.player = scene.player;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.base = {};
	}

	/// #if DEBUG

	debug() {
		const gui = debug.instance.addFolder({ title: debug.label });
	}
	/// #endif

	async loadTexture() {
		this.noiseTexture = await loadTexture('noiseTexture');
		this.noiseTexture.wrapS = this.noiseTexture.wrapT = RepeatWrapping;
	}

	async init() {
		await this.loadTexture();
		this.setDefaultGeometry();
		this.setInstancedGeometry();
		this.setMaterial();
		this.setMesh();

		/// #if DEBUG
		this.debug();
		/// #endif

		initialized = true;
	}

	setDefaultGeometry() {
		this.triangle = new BufferGeometry();

		const vertices = new Float32Array([
			-0.5 * params.verticeScale,
			-0.5 * params.verticeScale,
			0 * params.verticeScale, // bl
			0.5 * params.verticeScale,
			-0.5 * params.verticeScale,
			0 * params.verticeScale, // br
			0 * params.verticeScale,
			0.5 * params.verticeScale,
			0 * params.verticeScale, // tc
		]);

		const normal = new Float32Array([
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
		]);
		const uv = new Float32Array([0, 1, 1, 1, 0, 0]);
		const indices = new Uint16Array([0, 1, 2]);

		this.triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		this.triangle.setAttribute('normal', new BufferAttribute(normal, 3));
		this.triangle.setAttribute('uv', new BufferAttribute(uv, 2));
		this.triangle.setIndex(new BufferAttribute(indices, 1));
	}

	setInstancedGeometry() {
		const positions = new Float32Array(params.count * 2);
		const scale = new Float32Array(params.count * 1);

		for (let i = 0; i < params.count; i++) {
			positions[i * 3 + 0] = MathUtils.randFloatSpread(params.halfBoxSize * 2);
			positions[i * 3 + 2] = MathUtils.randFloatSpread(params.halfBoxSize * 2);

			const random = MathUtils.randFloat(1, 2);
			scale[i * 3 + 0] = random;
			scale[i * 3 + 1] = random;
			scale[i * 3 + 2] = random;
		}

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = this.triangle.index;
		this.base.geometry.attributes.position = this.triangle.attributes.position;
		this.base.geometry.attributes.uv = this.triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(positions, 3, false),
		);
		this.base.geometry.setAttribute('aScale', new InstancedBufferAttribute(scale, 3, false));
	}

	setMaterial() {
		this.charaPos = new Vector3();

		this.base.material = new ShaderMaterial({
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uHalfBoxSize: { value: params.halfBoxSize },
				uCharaPos: { value: this.charaPos },
				uNoiseTexture: { value: this.noiseTexture },
			},
			transparent: true,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});
	}

	setMesh() {
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		this.charaPos.copy(this.player.base.mesh.position);

		this.base.material.uniforms.uTime.value = et;
	}
}

import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	PlaneBufferGeometry,
	PlaneGeometry,
	RawShaderMaterial,
	RepeatWrapping,
	ShaderMaterial,
	TextureLoader,
	Triangle,
	Vector3,
	Vector4,
} from 'three';

import { mergeGeometry } from '@utils/webgl';
import { BaseToonMaterial } from '@webgl/Materials/BaseMaterials/toon/material';

import fragmentShader from './Shaders/fragment.glsl';
import vertexShader from './Shaders/vertex.glsl';

let initialized = false;

const params = {
	halfBoxSize: 20,
	verticeScale: 0.2,
	count: 30000,
};
/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

const cloudTexture = new TextureLoader().load('/assets/image/cloud.jpg');
cloudTexture.wrapS = cloudTexture.wrapT = RepeatWrapping;

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

	async init() {
		await this.setGrass();

		/// #if DEBUG
		this.debug();
		/// #endif

		initialized = true;
	}

	async setGrass() {
		this.charaPos = new Vector3();
		const particlesCount = params.count;

		this.positions = new Float32Array(particlesCount * 2);
		this.offset = new Float32Array(particlesCount * 1);
		this.scale = new Float32Array(particlesCount * 1);

		for (let i = 0; i < particlesCount; i++) {
			this.positions[i * 3 + 0] = MathUtils.randFloatSpread(params.halfBoxSize * 2);
			this.positions[i * 3 + 2] = MathUtils.randFloatSpread(params.halfBoxSize * 2);

			this.offset[i + 0] = MathUtils.randFloatSpread(75);
			const random = MathUtils.randFloat(1, 1.5);
			// const random = MathUtils.randFloat(1, 1);
			this.scale[i * 3 + 0] = random;
			this.scale[i * 3 + 1] = random;
			this.scale[i * 3 + 2] = random;
		}
		const blueprintParticle = new PlaneBufferGeometry();
		console.log(blueprintParticle);

		const triangle = new BufferGeometry();

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

		const tVec3a = new Vector3();
		const posTrigger = [];

		tVec3a.set(vertices[0 + 6], vertices[0 + 7], vertices[0 + 8]);

		// bl
		posTrigger[0] = tVec3a.x; // x
		posTrigger[0 + 1] = tVec3a.y; // y
		posTrigger[0 + 2] = tVec3a.z; // z
		// br
		posTrigger[0 + 3] = tVec3a.x; // x
		posTrigger[0 + 4] = tVec3a.y; // y
		posTrigger[0 + 5] = tVec3a.z; // z
		// tc
		posTrigger[0 + 6] = tVec3a.x; // x
		posTrigger[0 + 7] = tVec3a.y; // y
		posTrigger[0 + 8] = tVec3a.z; // z

		// itemSize = 3 because there are 3 values (components) per vertex
		triangle.setAttribute(
			'aTriggerPosition',
			new BufferAttribute(new Float32Array(posTrigger), 3),
		);
		triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		// triangle.setAttribute('normal', new BufferAttribute(normal, 3));
		triangle.setAttribute('uv', new BufferAttribute(uv, 2));
		triangle.setIndex(new BufferAttribute(indices, 1));

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = triangle.index;
		this.base.geometry.attributes.position = triangle.attributes.position;
		// this.base.geometry.attributes.normal = triangle.attributes.normal;
		this.base.geometry.attributes.uv = triangle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.positions, 3, false),
		);
		this.base.geometry.setAttribute(
			'aOffset',
			new InstancedBufferAttribute(this.offset, 3, false),
		);
		this.base.geometry.setAttribute(
			'aScale',
			new InstancedBufferAttribute(this.scale, 3, false),
		);
		this.base.material = new ShaderMaterial({
			// depthTest: false,
			// depthWrite: false,
			side: DoubleSide,
			// wireframe: true,
			uniforms: {
				uTime: { value: 0 },
				uHalfBoxSize: { value: params.halfBoxSize },
				uCharaPos: { value: this.charaPos },
			},
			transparent: true,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		// this.base.mesh.position.y -= 1;
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

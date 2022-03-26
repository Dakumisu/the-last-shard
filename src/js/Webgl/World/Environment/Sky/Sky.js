import {
	BoxBufferGeometry,
	Clock,
	Color,
	CubeTextureLoader,
	DoubleSide,
	GridHelper,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	PlaneBufferGeometry,
	RepeatWrapping,
	ShaderMaterial,
	SphereBufferGeometry,
	TextureLoader,
	UniformsUtils,
} from 'three';

import { getWebgl } from '@webgl/Webgl';

import { mergeGeometry } from '@utils/webgl';
import { store } from '@tools/Store';

import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Sky',
	tab: 'Env',
};
/// #endif

const cubeTextureLoader = new CubeTextureLoader();
const textureLoader = new TextureLoader();
const cloud = textureLoader.load('/assets/image/cloud.png');

const environmentMapTexture = cubeTextureLoader.load([
	'/assets/image/environmentMaps/1/px.png',
	'/assets/image/environmentMaps/1/nx.png',
	'/assets/image/environmentMaps/1/py.png',
	'/assets/image/environmentMaps/1/ny.png',
	'/assets/image/environmentMaps/1/pz.png',
	'/assets/image/environmentMaps/1/nz.png',
]);

export default class Sky {
	constructor() {
		const webgl = getWebgl();
		this.scene = webgl.scene.instance;

		this.base = {};

		/// #if DEBUG
		debug.instance = webgl.debug;
		/// #endif
	}

	/// #if DEBUG
	debug() {
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);
	}
	/// #endif

	async init() {
		await this.setSky();

		/// #if DEBUG
		this.debug();
		/// #endif

		initialized = true;
	}

	async setSky() {
		this.base.geometry = new SphereBufferGeometry(1, 32, 32, 0, Math.PI);
		this.base.geometry.rotateX(-Math.PI * 0.5);

		// this.base.material = fogMaterial.get();
		// this.base.material.side = DoubleSide;
		this.base.material = new ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: DoubleSide,
			transparent: true,
			uniforms: {
				uTime: { value: 0 },
				uTexture: { value: cloud },
			},
			// envMap: environmentMapTexture,
		});
		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		// this.scene.add(this.base.mesh);
		this.base.mesh.scale.set(600, 600, 600);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
		this.base.material.uniforms.uTime.value = et * 0.001;
		// this.base.mesh.rotation.x = et ;
	}
}

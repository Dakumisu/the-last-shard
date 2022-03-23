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
import fogMaterial from '@webgl/World/materials/fog/material';

import vertexShader from './Shader/vertexShader.glsl';
import fragmentShader from './Shader/fragmentShader.glsl';

let initialized = false;

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Sky',
};
/// #endif

const cubeTextureLoader = new CubeTextureLoader();
const textureLoader = new TextureLoader();
const cloud = textureLoader.load('/assets/image/cloud.png');
// cloud.wrapS = MirroredRepeatWrapping;
// cloud.wrapT = MirroredRepeatWrapping;

const environmentMapTexture = cubeTextureLoader.load([
	'/assets/image/environmentMaps/px.jpg',
	'/assets/image/environmentMaps/nx.jpg',
	'/assets/image/environmentMaps/py.jpg',
	'/assets/image/environmentMaps/ny.jpg',
	'/assets/image/environmentMaps/pz.jpg',
	'/assets/image/environmentMaps/nz.jpg',
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
		debug.instance.setFolder(debug.label);
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
		this.base.mesh.scale.set(300, 300, 300);
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

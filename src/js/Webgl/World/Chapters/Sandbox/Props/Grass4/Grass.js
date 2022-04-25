import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DoubleSide,
	Float32BufferAttribute,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	InstancedMesh,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	Object3D,
	PlaneBufferGeometry,
	PlaneGeometry,
	Quaternion,
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

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Grass',
};
/// #endif

const BLADE_WIDTH = 0.3;
const BLADE_HEIGHT = 0.5;
const BLADE_HEIGHT_VARIATION = 0.6;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function interpolate(val, oldMin, oldMax, newMin, newMax) {
	return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

const cloudTexture = new TextureLoader().load('/assets/image/cloud.jpg');
cloudTexture.wrapS = cloudTexture.wrapT = RepeatWrapping;

export default class Grass {
	constructor(scene) {
		this.scene = scene.instance;

		/// #if DEBUG
		debug.instance = scene.gui;
		/// #endif

		this.base = {};
		this.count = 4000000000;
	}

	/// #if DEBUG

	devtool() {
		const gui = debug.instance.addFolder({ title: debug.label });
	}
	/// #endif

	async init() {
		this.setGrass();

		/// #if DEBUG
		this.devtool();
		/// #endif

		initialized = true;
	}

	setGrass() {
		var mesh = getInstances(2000000);
		this.scene.add(mesh);
		mesh.frustumCulled = false;
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;
	}
}

function getInstances(count) {
	//creates an instancedBufferGeometry
	var geometry = new InstancedBufferGeometry();

	//a vertex buffer for the 'blueprint' representing a single triangle
	var blueprint = [];
	for (var i = 0; i < 3; i++) {
		var a = (Math.PI / 180) * 120 * i;
		blueprint.push(Math.cos(a), Math.sin(a), 0);
	}

	//assign the positions as a 'regular' BufferAttribute
	var attribute = new BufferAttribute(new Float32Array(blueprint), 3);
	geometry.setAttribute('position', attribute);

	//and that's it for the 'blueprint' ; all instances will share these data
	//we can add more ; normals and uvs are very often used to shade the mesh.

	//now for the InstancedBufferAttributes, what makes each instance different.

	//we create some float buffers to store the properties of each instance
	var translation = new Float32Array(count * 3);
	var rotation = new Float32Array(count * 4);
	var scale = new Float32Array(count * 3);

	//and iterators for convenience :)
	var translationIterator = 0;
	var rotationIterator = 0;
	var scaleIterator = 0;

	//and a temp quaternion (rotations are represented by Quaternions, not Eulers)
	var q = new Quaternion();

	//now let's feed some random values to transform the instances
	for (i = 0; i < count; i++) {
		//a random position
		translation[translationIterator++] = (Math.random() - 0.5) * 1000;
		translation[translationIterator++] = (Math.random() - 0.5) * 1000;
		translation[translationIterator++] = (Math.random() - 0.5) * 1000;

		//a random rotation

		//randomize quaternion not sure if it's how you do it but it looks random
		q.set(
			(Math.random() - 0.5) * 2,
			(Math.random() - 0.5) * 2,
			(Math.random() - 0.5) * 2,
			Math.random() * Math.PI,
		);
		q.normalize();

		//assign to bufferAttribute
		rotation[rotationIterator++] = q.x;
		rotation[rotationIterator++] = q.y;
		rotation[rotationIterator++] = q.z;
		rotation[rotationIterator++] = q.w;

		//a random scale
		scale[scaleIterator++] = 0.1 + Math.random() * 4;
		scale[scaleIterator++] = 0.1 + Math.random() * 4;
		scale[scaleIterator++] = 0.1 + Math.random() * 4;
	}

	console.log(i);

	//create the InstancedBufferAttributes from our float buffers
	geometry.setAttribute('translation', new InstancedBufferAttribute(translation, 3, false));
	geometry.setAttribute('rotation', new InstancedBufferAttribute(rotation, 4, false));
	geometry.setAttribute('scale', new InstancedBufferAttribute(scale, 3, false));

	// create a material
	var material = new RawShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: DoubleSide,
	});
	return new Mesh(geometry, material);
}

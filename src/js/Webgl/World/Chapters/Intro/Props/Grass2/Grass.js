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
		this.count = 1000000;
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
		const particlesCount = this.count;

		this.positions = new Float32Array(particlesCount * 3);

		for (let i = 0; i < particlesCount; i++) {
			this.positions[i * 3 + 0] = MathUtils.randFloatSpread(100);
			this.positions[i * 3 + 2] = MathUtils.randFloatSpread(100);
		}
		const blueprintParticle = new PlaneBufferGeometry();

		const trian = new Triangle(
			new Vector3(-1.0, -1.0, 1.0),
			new Vector3(1.0, -1.0, 1.0),
			new Vector3(0, 1.0, 1.0),
		);

		const triangle = new BufferGeometry();

		// create a simple square shape. We duplicate the top left and bottom right
		// vertices because each vertex needs to appear once per triangle.
		const vertices = new Float32Array([-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 0, 1.0, 1.0]);

		// itemSize = 3 because there are 3 values (components) per vertex
		triangle.setAttribute('position', new BufferAttribute(vertices, 3));
		triangle.setAttribute('normal', new BufferAttribute(vertices, 3));
		triangle.setAttribute('uv', new BufferAttribute(vertices, 3));
		const material = new MeshBasicMaterial({ color: 0xff0000 });
		const mesh = new Mesh(triangle, material);
		this.scene.add(mesh);
		mesh.position.z = 25;

		this.base.geometry = new InstancedBufferGeometry();

		this.base.geometry.index = blueprintParticle.index;
		this.base.geometry.attributes.position = blueprintParticle.attributes.position;
		this.base.geometry.attributes.normal = blueprintParticle.attributes.normal;
		this.base.geometry.attributes.uv = blueprintParticle.attributes.uv;

		this.base.geometry.setAttribute(
			'aPositions',
			new InstancedBufferAttribute(this.positions, 3, false),
		);
		this.base.material = new ShaderMaterial({
			// depthTest: false,
			// depthWrite: false,
			side: DoubleSide,
			// wireframe: true,
			uniforms: {
				uTime: { value: 0 },
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});

		this.base.mesh = new Mesh(this.base.geometry, this.base.material);
		this.scene.add(this.base.mesh);
		this.base.mesh.frustumCulled = false;

		// particles
		const particleSystem = new ParticleSystem();
		particleSystem.mesh.position.y = 0; // 10
		// this.scene.add(particleSystem.mesh);
	}

	resize() {
		if (!initialized) return;
	}

	update(et, dt) {
		if (!initialized) return;

		// this.base.material.uniforms.uTime.value = et;

		// console.log(et);
	}
}

function particlesVS() {
	return `
    precision highp float;
    uniform float time;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec3 position;
    attribute vec3 offset;
    attribute vec4 color;
    attribute vec4 orientationStart;
    attribute vec4 orientationEnd;
    attribute float timeOffset;
    varying vec3 vPosition;
    varying vec4 vColor;
    varying float lifeProgress;

    void main(){

      vPosition = offset;

      lifeProgress = mod(time+timeOffset,1.0);

      vPosition = offset * lifeProgress + position;
      vec4 orientation = normalize(mix(orientationStart, orientationEnd, lifeProgress));
      vec3 vcV = cross(orientation.xyz, vPosition);
      vPosition = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + vPosition);
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
    }`;
}

function particlesFS() {
	return `
    precision highp float;
    uniform float time;
    varying vec3 vPosition;
    varying vec4 vColor;
    varying float lifeProgress;

    void main() {
      float depth = gl_FragCoord.z / gl_FragCoord.w / 5.0;
      float opacity = clamp(0.2, 1.0, depth);
      vec4 color = vColor;
      //color.a = sin(lifeProgress*100.0)*opacity;
      gl_FragColor = color;
    }`;
}

class ParticleSystem {
	constructor() {
		this.time = 0.0;
		let triangles = 1;
		let instances = 2000000;
		let geometry = new InstancedBufferGeometry();

		let vertices = new BufferAttribute(new Float32Array(triangles * 3 * 3), 3);
		let unit = 0.15;
		vertices.setXYZ(0, unit, -unit, 0);
		vertices.setXYZ(1, -unit, unit, 0);
		vertices.setXYZ(2, 0, 0, unit);
		geometry.setAttribute('position', vertices);

		let offsets = new InstancedBufferAttribute(new Float32Array(instances * 3), 3, false);
		let dist = 80;
		for (let i = 0, ul = offsets.count; i < ul; i++) {
			offsets.setXYZ(
				i,
				(Math.random() - 0.5) * dist,
				(Math.random() - 0.5) * dist,
				(Math.random() - 0.5) * dist,
			);
		}
		geometry.setAttribute('offset', offsets);

		let colors = new InstancedBufferAttribute(new Float32Array(instances * 4), 4, false);

		let threeColor = new Color();
		for (let i = 0, ul = colors.count; i < ul; i++) {
			let c = threeColor.setHex(0xf2f2f2);
			colors.setXYZW(i, c.r, c.g, c.b, 1);
		}
		geometry.setAttribute('color', colors);

		let timeOffsets = new InstancedBufferAttribute(new Float32Array(instances * 1), 1, false);

		for (let i = 0, ul = timeOffsets.count; i < ul; i++) {
			timeOffsets.setX(i, Math.random());
		}
		geometry.setAttribute('timeOffset', timeOffsets);

		let vector = new Vector4();
		let orientationsStart = new InstancedBufferAttribute(
			new Float32Array(instances * 4),
			4,
			false,
		);
		for (let i = 0, ul = orientationsStart.count; i < ul; i++) {
			vector.set(
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
			);
			vector.normalize();
			orientationsStart.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
		}
		geometry.setAttribute('orientationStart', orientationsStart);

		let orientationsEnd = new InstancedBufferAttribute(
			new Float32Array(instances * 4),
			4,
			false,
		);
		for (let i = 0, ul = orientationsEnd.count; i < ul; i++) {
			vector.set(
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
				Math.random() * 2 - 1,
			);
			vector.normalize();
			orientationsEnd.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
		}
		geometry.setAttribute('orientationEnd', orientationsEnd);

		let material = new RawShaderMaterial({
			uniforms: {
				time: { value: 1.0 },
			},
			vertexShader: particlesVS(),
			fragmentShader: particlesFS(),
			side: DoubleSide,
			transparent: true,
		});

		let mesh = new Mesh(geometry, material);
		mesh.frustumCulled = false;
		this.mesh = mesh;
	}
}

// https://codepen.io/Firok/pen/oZywPy

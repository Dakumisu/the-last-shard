import { getWebgl } from '@webgl/Webgl';
import baseUniforms from '@webgl/World/materials/baseUniforms';
import { CustomMeshBasicMaterial } from '@webgl/World/materials/CustomMeshBasicMaterial/CustomMeshBasicMaterial';
import { Color, CubeTextureLoader, Fog, ShaderChunk } from 'three';
import fogFrag from './Shader/fogFrag.glsl';
import fogParsFrag from './Shader/fogParsFrag.glsl';
import fogParsVert from './Shader/fogParsVert.glsl';
import fogVert from './Shader/fogVert.glsl';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Fog',
	tab: 'Env',
};
/// #endif

const params = {
	fogNearColor: '#844bb8',
	fogFarColor: '#3e2e77',
	fogNear: 0,
	fogFar: 100,
	fogNoiseSpeed: 0.0035,
	fogNoiseFreq: 0.065,
	fogNoiseImpact: 0.0,
	fogNoiseAmount: 0.2,
};

const cubeTextureLoader = new CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
	'/assets/image/environmentMaps/1/px.png',
	'/assets/image/environmentMaps/1/nx.png',
	'/assets/image/environmentMaps/1/py.png',
	'/assets/image/environmentMaps/1/ny.png',
	'/assets/image/environmentMaps/1/pz.png',
	'/assets/image/environmentMaps/1/nz.png',
]);

let initialized = false;
export default class CustomFog {
	constructor() {
		this.webgl = getWebgl();
		this.scene = this.webgl.scene.instance;

		this.setFog();
		/// #if DEBUG
		this.setDebug();
		/// #endif
	}

	setFog() {
		baseUniforms.uFogNearColor.value = new Color(params.fogNearColor);
		baseUniforms.uFogNoiseFreq.value = params.fogNoiseFreq;
		baseUniforms.uFogNoiseSpeed.value = params.fogNoiseSpeed;
		baseUniforms.uFogNoiseImpact.value = params.fogNoiseImpact;
		baseUniforms.uFogNoiseAmount.value = params.fogNoiseAmount;

		ShaderChunk.fog_pars_vertex = fogParsVert;
		ShaderChunk.fog_vertex = fogVert;
		ShaderChunk.fog_pars_fragment = fogParsFrag;
		ShaderChunk.fog_fragment = fogFrag;
		const fog = new Fog(params.fogFarColor, params.fogNear, params.fogFar);
		this.scene.fog = fog;
		this.scene.background = environmentMapTexture;

		initialized = true;
	}

	/// #if DEBUG
	setDebug() {
		debug.instance = this.webgl.debug;
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(params, 'fogFarColor', { label: 'farColor', view: 'color' }).on(
			'change',
			(fogFarColor) => {
				this.scene.fog.color.set(fogFarColor.value);
			},
		);
		gui.addInput(params, 'fogNearColor', {
			label: 'nearColor',
			view: 'color',
		}).on('change', (fogNearColor) => {
			baseUniforms.uFogNearColor.value.set(fogNearColor.value);
		});
		gui.addInput(params, 'fogFar', { label: 'farRange', min: 20, max: 150, step: 0.01 }).on(
			'change',
			(fogFar) => {
				this.scene.fog.far = fogFar.value;
			},
		);
		gui.addInput(params, 'fogNear', { label: 'nearRange', min: 0, max: 50, step: 0.01 }).on(
			'change',
			(fogNear) => {
				this.scene.fog.near = fogNear.value;
			},
		);
		gui.addInput(baseUniforms.uFogNoiseSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 0.02,
			step: 0.001,
		}).on('change', (speed) => {
			baseUniforms.uFogNoiseSpeed.value = speed.value;
		});
		gui.addInput(baseUniforms.uFogNoiseFreq, 'value', {
			label: 'frequency',
			min: 0,
			max: 2,
			step: 0.001,
		}).on('change', (freq) => {
			baseUniforms.uFogNoiseFreq.value = freq.value;
		});
		gui.addInput(baseUniforms.uFogNoiseImpact, 'value', {
			label: 'impact',
			min: 0,
			max: 1,
			step: 0.001,
		}).on('change', (imp) => {
			baseUniforms.uFogNoiseImpact.value = imp.value;
		});
		gui.addInput(baseUniforms.uFogNoiseAmount, 'value', {
			label: 'amount',
			min: 0,
			max: 1,
			step: 0.001,
		}).on('change', (amount) => {
			baseUniforms.uFogNoiseAmount.value = amount.value;
		});
	}
	/// #endif

	// update(et, dt) {
	// 	if (!initialized) return;
	// 	if (baseUniforms) {
	// 		baseUniforms.time.value = et;
	// 	}
	// }
}

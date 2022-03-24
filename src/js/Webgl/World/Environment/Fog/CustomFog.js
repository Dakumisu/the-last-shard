import { getWebgl } from '@webgl/Webgl';
import { CustomMeshBasicMaterial } from '@webgl/World/Materials/CustomMeshBasicMaterial/CustomMeshBasicMaterial';
import fogMaterial from '@webgl/World/Materials/fog/material';
import { Color, FogExp2, MeshBasicMaterial, ShaderChunk } from 'three';
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
	fogBgColor: '#39e1ff',
	fogNearColor: '#e3dbd0',
	fogFarColor: '#36a6ba',
	fogDensity: 0.02,
	fogNoiseSpeed: 0.001,
	fogNoiseFreq: 0.25,
	fogNoiseImpact: 0.2,
};

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
		const matOpts = {
			uniforms: {
				fogNearColor: { value: new Color(params.fogNearColor) },
				fogNoiseFreq: { value: params.fogNoiseFreq },
				fogNoiseSpeed: { value: params.fogNoiseSpeed },
				fogNoiseImpact: { value: params.fogNoiseImpact },
				time: { value: 0 },
			},
		};
		this.material = fogMaterial.get(matOpts);

		ShaderChunk.fog_pars_vertex = fogParsVert;
		ShaderChunk.fog_vertex = fogVert;
		ShaderChunk.fog_pars_fragment = fogParsFrag;
		ShaderChunk.fog_fragment = fogFrag;
		const fog = new FogExp2(params.fogFarColor, params.fogDensity);
		this.scene.fog = fog;
		this.scene.background = new Color(params.fogBgColor);

		initialized = true;
	}

	/// #if DEBUG
	setDebug() {
		debug.instance = this.webgl.debug;
		debug.instance.setFolder(debug.label, debug.tab);
		const gui = debug.instance.getFolder(debug.label);

		gui.addInput(params, 'fogBgColor', { label: 'bgColor', view: 'color' }).on(
			'change',
			(fogBgColor) => {
				this.scene.background.set(fogBgColor.value);
			},
		);
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
			this.material.uniforms.fogNearColor.value.set(fogNearColor.value);
		});

		gui.addInput(this.scene.fog, 'density', {
			min: 0,
			max: 0.5,
			step: 0.01,
		});
		gui.addInput(this.material.uniforms.fogNoiseSpeed, 'value', {
			label: 'speed',
			min: 0,
			max: 0.02,
			step: 0.001,
		}).on('change', (speed) => {
			this.material.uniforms.fogNoiseSpeed.value = speed.value;
		});
		gui.addInput(this.material.uniforms.fogNoiseFreq, 'value', {
			label: 'frequency',
			min: 0,
			max: 2,
			step: 0.001,
		}).on('change', (freq) => {
			this.material.uniforms.fogNoiseFreq.value = freq.value;
		});
		gui.addInput(this.material.uniforms.fogNoiseImpact, 'value', {
			label: 'impact',
			min: 0,
			max: 1,
			step: 0.001,
		}).on('change', (imp) => {
			this.material.uniforms.fogNoiseImpact.value = imp.value;
		});
	}
	/// #endif

	update(et, dt) {
		if (!initialized) return;
		if (this.material) {
			this.material.uniforms.time.value = et;
		}
	}
}

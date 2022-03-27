import Player from '@webgl/World/Characters/Player';
import BaseScene from '../../../Scene/BaseScene';
import Ground from './Props/Ground';
import Lights from './Environment/Lights/Lights';
import BaseFog from '@webgl/World/Bases/Fog/BaseFog';
import { loadCubeTexture } from '@utils/loaders/loadAssets';

export default class IntroScene extends BaseScene {
	constructor() {
		super({ label: 'IntroScene' });
	}

	async init(player, currentCamera) {
		super.init(player, currentCamera);

		this.lights = new Lights(this);

		this.ground = new Ground(this);
		await this.ground.init();

		this.player = new Player({ ground: this.ground.base.mesh });

		this.fog = new BaseFog({
			fogNearColor: '#844bb8',
			fogFarColor: '#3e2e77',
			fogNear: 0,
			fogFar: 140,
			fogNoiseSpeed: 0.003,
			fogNoiseFreq: 0.125,
			fogNoiseImpact: 0.1,
			background: await loadCubeTexture('envMap1'),
			/// #if DEBUG
			gui: this.gui,
			/// #endif
		});

		this.instance.add(this.ground.base.mesh, this.player.base.mesh);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
		if (this.player) this.player.update(et, dt);
	}

	addTo(mainScene) {
		super.addTo(mainScene);
		this.fog.set();
	}
}

import Player from '@webgl/World/Entities/Player';
import BaseScene from '../BaseScene';
import Ground from './Children/Ground';
import Lights from './Lights/Lights';

export default class IntroScene extends BaseScene {
	constructor() {
		super({ label: 'IntroScene' });

		this.initScene();
	}

	async initScene(player, currentCamera) {
		super.initScene(player, currentCamera);

		this.lights = new Lights(this);

		this.ground = new Ground(this);

		await this.ground.init();

		this.player = new Player({ ground: this.ground.base.mesh });

		this.instance.add(this.ground.base.mesh, this.player.base.mesh);
		// console.log('Custom init : ', this.label);
	}

	update(et, dt) {
		super.update(et, dt);
		if (this.ground) this.ground.update(et, dt);
		if (this.player) this.player.update(et, dt);
	}
}

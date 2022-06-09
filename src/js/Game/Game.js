import { SoundController } from '@js/Sound/Controller';
import Keyboard from '@tools/Keyboard';
import Control from './Control';

let initialized = false;

class Game {
	static instance;

	constructor() {
		Game.instance = this;

		this.init();
		this.event();
	}

	async init() {
		this.keyboard = new Keyboard();

		this.control = new Control();

		this.soundController = new SoundController();
		await this.soundController.init();

		initialized = true;
	}

	event() {
		if (!initialized) return;
	}

	update() {
		if (!initialized) return;
	}

	destroy() {
		this.keyboard.destroy();

		delete Game.instance;
	}
}

const initGame = () => {
	return new Game();
};

const getGame = () => {
	return Game.instance;
};

export { initGame, getGame };

import signal from 'philbin-packages/signal';

import Keyboard from '@tools/Keyboard';
import Control from './Control';
import Dialog from './Dialog';

let initialized = false;

class Game {
	static instance;

	constructor() {
		Game.instance = this;

		this.init();
		this.listeners();
	}

	async init() {
		this.keyboard = new Keyboard();
		this.control = new Control();
		this.dialog = new Dialog();

		initialized = true;
	}

	listeners() {
		if (!initialized) return;

		signal.on('raf', () => {
			this.update();
		});
	}

	update() {
		if (!initialized) return;

		this.dialog.update();
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

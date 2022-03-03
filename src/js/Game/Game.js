import Keyboard from '@tools/Keyboard';
import Control from './Control';

let initialized = false;

class Game {
	static instance;

	constructor() {
		Game.instance = this;
	}

	async init() {
		this.keyboard = new Keyboard();

		this.control = new Control();

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

export const getGame = () => {
	if (Game.instance) return Game.instance;

	const g = new Game();
	g.init();
	g.event();

	return g;
};

import signal from 'philbin-packages/signal';

import Keyboard from '@tools/Keyboard';
import Control from './Control';
import Dialog from './Dialog';
import { getDom } from '@dom/Dom';
import { store } from '@tools/Store';

let initialized = false;

let dom;

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
		// this.dialog = new Dialog();

		dom = getDom();

		this.setupSave();

		initialized = true;
	}

	listeners() {
		if (!initialized) return;

		signal.on('raf', () => {
			this.update();
		});
	}

	save(label, value) {
		if (!label) {
			console.error('Game save: label is required');
			return;
		}

		localStorage.setItem(`game:${label}`, value);
	}

	getSave(label) {
		return localStorage.getItem(`game:${label}`);
	}

	setupSave() {
		store.game.fragmentsCollected = dom.nodes.domElements['fragment_count'].innerHTML =
			JSON.parse(this.getSave('fragments')) || 0;
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

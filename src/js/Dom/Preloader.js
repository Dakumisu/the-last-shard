import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { wait } from 'philbin-packages/async';

let dom;

export class Preloader {
	constructor() {
		dom = getDom();

		this.setup();
	}

	setup() {
		signal.on('dom:complete', () => this.start());
	}

	async start() {
		signal.emit('view:change', 'preloader');
		signal.emit('sound: down', store.game.currentScene);

		this.show();
		await wait(60);

		this.hide();

		signal.emit('preloader:complete');
	}

	show() {
		dom.nodes.domElements.preloading_container.classList.add('visible');
	}

	hide() {
		dom.nodes.domElements.preloading_container.classList.remove('visible');
	}
}

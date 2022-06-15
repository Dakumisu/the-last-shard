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
		this.show();
		await wait(500);
		// await wait(6000);

		signal.emit('preloader:complete');

		this.hide();
	}

	show() {
		dom.nodes.domElements.preloading_container.classList.add('visible');
	}

	hide() {
		dom.nodes.domElements.preloading_container.classList.remove('visible');
	}
}

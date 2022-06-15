import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { wait } from 'philbin-packages/async';

let dom;

export class Context {
	constructor() {
		dom = getDom();

		this.setup();
	}

	setup() {
		signal.on('preloader:complete', () => this.start());
	}

	async start() {
		this.texts = dom.nodes.domElements.context;

		signal.emit('view:change', 'context');
		signal.emit('sound: down', store.game.currentScene);

		this.show(dom.nodes.domElements.context_container);

		// await wait(1000);
		// this.show(this.texts[0]);
		// await wait(4000);
		// this.hide(this.texts[0]);
		await wait(500);
		// this.show(this.texts[1]);
		// await wait(7500);
		// this.hide(this.texts[1]);
		// await wait(1000);

		this.hide(dom.nodes.domElements.context_container);
		this.show(dom.nodes.domElements.canvas);

		signal.emit('context:complete');
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}

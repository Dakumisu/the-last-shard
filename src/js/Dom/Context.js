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

		signal.emit('context:complete');

		this.hide(dom.nodes.domElements.context_container);
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}

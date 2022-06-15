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
		this.texts = dom.nodes.domElements.context;
	}

	async start() {
		signal.emit('view:change', 'context');

		await wait(1000);
		this.show(this.texts[0]);
		await wait(4000);
		this.hide(this.texts[0]);
		await wait(500);
		this.show(this.texts[1]);
		await wait(7500);
		this.hide(this.texts[1]);

		signal.emit('context:complete');
	}

	show(text) {
		text.classList.add('visible');
	}

	hide(text) {
		text.classList.remove('visible');
	}
}

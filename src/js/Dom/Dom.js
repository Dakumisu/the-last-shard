import CtaButton from './Components/button/CtaButton';
import AnchorLink from './Components/link/AnchorLink';

import Nodes from './Nodes';
import Views from './Views';

import { Context } from './Context';
import signal from 'philbin-packages/signal';

let initialized = false;

class Dom {
	/**
	 * @type {Dom}
	 */
	static instance;

	constructor() {
		Dom.instance = this;

		this.init();
		this.listeners();
	}

	init() {
		this.nodes = new Nodes();
		this.views = new Views();
	}

	listeners() {
		signal.on('dom:complete', async () => {
			this.context = new Context();
			await this.context.start();
			// this.home = new Home();
			// this.game = new Game();
			// this.menu = new Menu();
		});
	}

	destroy() {
		this.nodes.destroy();
		this.views.destroy();

		delete this.nodes;
		delete this.views;
	}
}

const initDom = () => {
	return new Dom();
};

const getDom = () => {
	return Dom.instance;
};

export { initDom, getDom };

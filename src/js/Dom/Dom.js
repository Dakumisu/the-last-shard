import CtaButton from './Components/button/CtaButton';
import AnchorLink from './Components/link/AnchorLink';

import Nodes from './Nodes';
import Views from './Views';

import signal from 'philbin-packages/signal';
import { Context } from './Context';
import { Preloader } from './Preloader';
import { Home } from './Home';
import { store } from '@tools/Store';
import { Hud } from './Hud';
import { Pause } from './Pause';

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
		store.game.player.canMove = store.game.player.canInteract = false;
		store.game.isPaused = true;

		this.nodes = new Nodes();
		this.views = new Views();

		this.preLoader = new Preloader();
		this.context = new Context();
		this.home = new Home();
		this.hud = new Hud();
		this.pause = new Pause();
	}

	listeners() {}

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

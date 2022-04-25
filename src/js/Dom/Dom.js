import CtaButton from './Components/button/CtaButton';
import AnchorLink from './Components/link/AnchorLink';

import Nodes from './Nodes';
import Views from './Views';

let initialized = false;

class Dom {
	/**
	 * @type {Dom}
	 */
	static instance;

	constructor() {
		Dom.instance = this;

		this.init();
	}

	init() {
		this.nodes = new Nodes();
		this.views = new Views();
	}

	event() {
		if (!initialized) return;
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

import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';

let dom;
let webgl;

let alreadyInitialized = false;

export class Pause {
	constructor() {
		dom = getDom();

		this.setup();
	}

	setup() {
		signal.on('game:pause', () => this.start());
	}

	start() {
		webgl = getWebgl();

		signal.emit('view:change', 'pause');
		signal.emit('sound: down', store.game.currentScene);

		this.show(dom.nodes.domElements.pause_container);
		this.events();

		alreadyInitialized = true;
	}

	events() {
		if (alreadyInitialized) return;

		dom.nodes.domElements.button_resume.addEventListener('click', (e) => {
			this.hide(dom.nodes.domElements.pause_container);

			store.game.isPaused = false;
			store.game.player.canMove = store.game.player.canInteract = true;

			signal.emit('game:resume');
		});
		dom.nodes.domElements.button_back.addEventListener('click', (e) => {
			this.hide(dom.nodes.domElements.pause_container);

			signal.emit('pause:back');
		});
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}

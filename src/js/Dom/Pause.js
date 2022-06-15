import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';

let dom;
let webgl;

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

		this.show(dom.nodes.domElements.pause_container);
		this.events();
	}

	events() {
		// dom.nodes.domElements.button_sound.addEventListener('click', (e) => {
		// 	let active = dom.nodes.domElements.button_sound.classList.contains('active');
		// 	if (active) {
		// 		dom.nodes.domElements.button_sound.classList.remove('active');
		// 		signal.emit('sound:beforeSwitch', store.game.currentScene.label);
		// 	} else {
		// 		dom.nodes.domElements.button_sound.classList.add('active');
		// 		signal.emit('sound:afterSwitch', store.game.currentScene.label);
		// 	}
		// });
		// dom.nodes.domElements.button_fullscreen.addEventListener('click', (e) => {
		// 	document.body.requestFullscreen();
		// });
		// dom.nodes.domElements.button_pause.addEventListener('click', (e) => {
		// 	signal.emit('game:pause');
		// 	store.game.isPaused = true;
		// 	store.game.player.canMove = store.game.player.canInteract = false;
		// });
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}

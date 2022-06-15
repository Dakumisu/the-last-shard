import { getDom } from './Dom';
import signal from 'philbin-packages/signal';
import { store } from '@tools/Store';
import { getWebgl } from '@webgl/Webgl';

let dom;
let webgl;

let alreadyInitialized = false;

export class Home {
	constructor() {
		dom = getDom();

		this.setup();
	}

	setup() {
		signal.on('context:complete', () => this.start());
		signal.on('pause:back', () => this.start());
	}

	start() {
		webgl = getWebgl();

		signal.emit('view:change', 'home');
		signal.emit('sound: down', store.game.currentScene);

		this.show(dom.nodes.domElements.home_container);

		this.events();

		alreadyInitialized = true;
	}

	events() {
		if (alreadyInitialized) return;

		dom.nodes.domElements.button_start.addEventListener('click', (e) => {
			webgl.world.homeCamera.start();

			store.game.isPaused = false;
			store.game.player.canMove = store.game.player.canInteract = true;
			this.hide(dom.nodes.domElements.home_container);
			signal.emit('home:quit');
		});

		dom.nodes.domElements.button_quit.addEventListener('click', (e) => {
			console.log('bye');
			webgl.destroy();
		});
	}

	show(node) {
		node.classList.add('visible');
	}

	hide(node) {
		node.classList.remove('visible');
	}
}

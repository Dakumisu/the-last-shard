import signal from 'philbin-packages/signal';
import { wait, throttle } from 'philbin-packages/async';
import { tryCatch } from 'philbin-packages/misc';

import { store } from '@tools/Store';

import { getGame } from './Game';

import dialog from '@json/dialog.json?json';
import { MathUtils } from 'three';

let pool = [];
let length = 0;
let index = 0;

let dialogSet = false;

let dummyKeyboard = {
	escape: false,
	shift: false,
	space: false,
};

export default class Dialog {
	constructor() {
		const game = getGame();
		this.keyPressed = game.control.keyPressed;

		this.dialog = dialog;

		this.spriteId = 0;

		this.listeners();
	}

	listeners() {
		signal.on('dialog:open', this.open.bind(this));
		signal.on('dialog:next', this.nextLine);
	}

	async open({ scene = '', sequence = '' }) {
		console.log(scene, sequence);

		let dialog = null;

		try {
			dialog = this.dialog[scene][sequence];
			/// #if DEBUG
			console.log('[DIALOG]', dialog);
			/// #endif
		} catch (error) {
			/// #if DEBUG
			console.error('no dialog here');
			/// #endif
			return;
		}

		dialogSet = false;

		if (!dialog) return;

		signal.emit('postpro:transition-in', 500);
		await wait(500);
		store.game.player.canMove = store.game.player.canInteract = false;
		signal.emit('dialog:start');
		signal.emit('camera:switch', 'dialog');
		signal.emit('postpro:transition-out');

		const dialogPool = [];
		dialog.forEach((line) => {
			dialogPool.push(line);
		});

		pool = dialogPool;
		length = pool.length;
		index = 0;

		dialogSet = true;

		this.nextLine();
	}

	nextLine = throttle(() => {
		if (index >= length) {
			this.close();

			return;
		}

		console.log('[DIALOG] nextline');

		this.speak({ line: pool[index] });
		index++;

		return this;
	}, 500);

	speak({ line = '' }) {
		signal.emit('sound:play', 'pet-happy', { spriteId: this.spriteId % 4 });
		this.spriteId++;
		console.log('[line]', line);
	}

	async close() {
		dialogSet = false;

		signal.emit('postpro:transition-in', 500);
		await wait(500);
		store.game.player.canMove = store.game.player.canInteract = true;
		signal.emit('dialog:complete');
		signal.emit('camera:switch', 'player');
		signal.emit('postpro:transition-out');

		console.log('[DIALOG] close');
	}

	update() {
		if (!dialogSet) return;

		if (dummyKeyboard.space !== this.keyPressed.space) {
			dummyKeyboard.space = this.keyPressed.space;

			if (this.keyPressed.space) {
				this.nextLine();
			}
		}
		if (this.keyPressed.escape) this.close();
	}
}

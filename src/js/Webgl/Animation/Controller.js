import { AnimationMixer, LoopOnce, LoopRepeat } from 'three';
import { wait } from 'philbin-packages/misc';

import { getWebgl } from '@webgl/Webgl';

/// #if DEBUG
const debug = {
	instance: null,
	parentLabel: 'null',
	label: 'Animation',
};
/// #endif

let initialized = false;

export default class AnimationController {
	constructor(opts = {}) {
		if (!opts.model) return;
		this.model = opts.model;
		this.name = opts.name || 'null';

		this.animations = this.model.animations;

		this.set();

		/// #if DEBUG
		const webgl = getWebgl();
		debug.instance = webgl.debug;
		debug.parentLabel = this.name;
		this.debug();
		/// #endif
	}

	/// #if DEBUG
	debug() {
		const parentGui = debug.instance.getFolder(debug.parentLabel);
		const gui = parentGui.addFolder({
			title: debug.label,
		});

		for (const key in this.actions.list) {
			gui.addButton({
				title: this.actions.list[key].name,
			}).on('click', () => {
				this.switch(this.actions.list[key]);
			});
		}
	}
	/// #endif

	set() {
		this.mixer = new AnimationMixer(this.model.scene);

		this.actions = {};
		this.actions.list = {};
		this.actions.current = null;

		this.animations.forEach((animation) => {
			this.actions.list[animation.name] = {};
			this.actions.list[animation.name].name = animation.name;
			this.actions.list[animation.name].animation = this.mixer.clipAction(animation);
		});

		this.setCurrent(Object.values(this.actions.list)[0], true);
		this.actions.current.animation.play();

		initialized = true;
	}

	get(name) {
		const r = this.actions.list[name];
		if (!r) {
			console.error(`Animation '${name}' in '${this.name}' doesn't exist ❌`);
			return;
		}
		return r;
	}

	switch(action, loop = true) {
		if (!initialized) return;

		const newAction = action;
		const oldAction = this.actions.current;

		if (newAction === oldAction) return;

		if (!loop) {
			newAction.animation.loop = LoopOnce;
			newAction.animation.clampWhenFinished = true;
		} else {
			newAction.animation.loop = LoopRepeat;
		}
		newAction.animation.reset();
		newAction.animation.play();
		newAction.animation.crossFadeFrom(oldAction.animation, 1);

		this.setCurrent(newAction);
		/// #if DEBUG
		console.log(
			`💫 Animation of '${this.name}' switch from '${oldAction.name}' to '${newAction.name}'`,
		);
		/// #endif
	}

	async playOnce(action) {
		if (!initialized) return;

		// this.setCurrent(action);
		// action.animation.play();
		const oldAction = this.actions.current;

		this.switch(action, false);
		await wait(1000);
		this.switch(this.actions.current);

		// this.mixer.addEventListener('loop', function (e) {
		// 	console.log('here');
		// });
	}

	setCurrent(action, force = false) {
		if (force) {
			this.actions.current = action;
			return this;
		}

		if (action) {
			this.actions.current = action;
			return this;
		} else {
			console.error(`Animation '${action.name}' in '${this.name}' doesn't exist ❌`);
			return;
		}
	}

	delete() {}

	destroy() {}

	update(dt) {
		if (!initialized) return;

		this.mixer.update(dt * 0.001);
	}
}
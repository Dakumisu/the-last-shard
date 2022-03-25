import { AnimationMixer } from 'three';

export default class Controller {
	constructor(opts = {}) {
		this.animations = {};
	}

	set() {
		this.animation = {};

		// Mixer
		this.animation.mixer = new AnimationMixer(this.model);

		// Actions
		this.animation.actions = {};

		// this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
		// this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
		// this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])

		// this.animation.actions.current = this.animation.actions.idle
		this.animation.actions.current.play();

		// Play the action
		this.animation.play = (name) => {
			const newAction = this.animation.actions[name];
			const oldAction = this.animation.actions.current;

			newAction.reset();
			newAction.play();
			newAction.crossFadeFrom(oldAction, 1);

			this.animation.actions.current = newAction;
		};

		/// #if DEBUG

		// const debugObject = {
		//     playIdle: () => { this.animation.play('idle') },
		//     playWalking: () => { this.animation.play('walking') },
		//     playRunning: () => { this.animation.play('running') }
		// }
		// this.debugFolder.add(debugObject, 'playIdle')
		// this.debugFolder.add(debugObject, 'playWalking')
		// this.debugFolder.add(debugObject, 'playRunning')
		/// #endif
	}

	get() {}

	delete() {}

	destroy() {}

	update(dt) {
		this.animation.mixer.update(dt * 0.001);
	}
}

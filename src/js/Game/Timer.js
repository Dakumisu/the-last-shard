import { getWebgl } from '@webgl/Webgl';
import { debounce } from 'philbin-packages/async';

/// #if DEBUG
const debug = {
	instance: null,
	label: 'Timers',
	tab: 'Scene',
	folder: null,
};
/// #endif

export default class Timer {
	static timers = [];
	constructor(duration, name, onComplete = () => {}, onUpdate = (et) => {}) {
		this.duration = duration;
		this.startTime = 0;
		this.elapsedTime = 0;

		this.pausedTime = 0;

		this.onComplete = onComplete;
		this.onUpdate = onUpdate;

		this.playing = false;

		this.name = name;

		Timer.timers.push(this);

		/// #if DEBUG
		debug.instance = getWebgl().debug;
		this.devtools();
		/// #endif
	}

	start() {
		if (this.startTime !== 0) this.reset();

		/// #if DEBUG
		console.log('🕦 Timer started');
		/// #endif

		this.playing = true;
		this.startTime = Date.now();
	}

	pause() {
		/// #if DEBUG
		console.log('🕦 Timer paused');
		/// #endif

		this.pausedTime = Date.now() - this.startTime;

		this.playing = false;
	}

	resume() {
		/// #if DEBUG
		console.log('🕦 Timer resumed');
		/// #endif

		this.startTime = Date.now() - this.pausedTime;

		this.playing = true;
	}

	stop() {
		if (!this.playing) return;

		/// #if DEBUG
		console.log('🕦 Timer stopped');
		/// #endif
		this.playing = false;
		this.reset();

		this.onComplete();
	}

	reset() {
		/// #if DEBUG
		console.log('🕦 Timer reset');
		/// #endif
		this.elapsedTime = 0;
		this.pausedTime = 0;
	}

	/// #if DEBUG
	devtools() {
		if (!debug.folder) {
			debug.instance.setFolder(debug.label, debug.tab, false);
			debug.folder = debug.instance.getFolder(debug.label);
		}

		const gui = debug.folder.addFolder({ title: this.name, expanded: false });

		gui.addMonitor(this, 'playing');
		gui.addMonitor(this, 'elapsedTime');
		gui.addButton({ title: 'Play/pause' }).on('click', () => {
			if (this.playing) this.pause();
			else if (this.pausedTime > 0 && !this.playing) this.resume();
			else this.start();
		});
	}
	/// #endif

	update() {
		if (!this.playing) return;

		this.elapsedTime = Date.now() - this.startTime;

		this.onUpdate(this.elapsedTime);

		if (this.elapsedTime >= this.duration) this.stop();
	}

	static update() {
		for (const timer of Timer.timers) timer.update();
	}
}

export default class Timer {
	static timers = [];
	constructor(duration, onComplete = () => {}, onUpdate = (et) => {}) {
		this.duration = duration;
		this.startTime = 0;
		this.elapsedTime = 0;

		this.pausedTime = 0;

		this.onComplete = onComplete;
		this.onUpdate = onUpdate;

		this.playing = false;

		Timer.timers.push(this);
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

		this.playing = false;
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

	update() {
		if (!this.playing) return;

		this.elapsedTime = Date.now() - this.startTime - this.pausedTime;

		this.onUpdate(this.elapsedTime);

		if (this.elapsedTime >= this.duration) this.stop();
	}

	static update() {
		for (const timer of Timer.timers) timer.update();
	}
}

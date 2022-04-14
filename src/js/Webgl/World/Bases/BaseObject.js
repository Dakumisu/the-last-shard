export default class BaseObject {
	constructor({ mesh = null, name = '' } = {}) {
		this.base = {
			mesh,
			name,
		};
	}
}

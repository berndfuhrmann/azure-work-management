export class ApiError extends Error {
	constructor(innerError?: Error) {
		let message = innerError?.message;
		if (message) {
			try {
				const jsonString = message?.substring(message?.indexOf('{')) ?? '';
				const json = JSON.parse(jsonString);
				message = json.message;
			} catch (e) {}
		}
		super(message, { cause: innerError });
	}
}

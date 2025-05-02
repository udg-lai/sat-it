import { addToast } from '$lib/store/toasts.store.ts';

export function logWarning(title: string, description: string): void {
	console.info('title:\n', title, '\ndescription:\n', description);
	addToast({
		type: 'warn',
		title: formatText(title),
		description: formatText(description),
		dismissible: true,
		timeout: 10000
	});
}

export function logInfo(title: string, description?: string): void {
	console.info('title:\n', title, '\ndescription:\n', description);
	addToast({
		type: 'info',
		title: formatText(title),
		description: formatText(description),
		dismissible: true
	});
}

export function logError(title: string, description?: string): void {
	console.error('title:\n', title, '\ndescription:\n', description);
	addToast({
		type: 'error',
		title: formatText(title),
		description: formatText(description),
		dismissible: false
	});
}

export function logFatal(title: string, description?: string): never {
	logError(title, description);
	throw title;
}

function formatText(text?: string): string {
	return text === undefined ? '' : text.at(0)?.toUpperCase() + text.substring(1).toLowerCase();
}

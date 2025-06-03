import { writable, type Writable } from 'svelte/store';

type ToastType = 'error' | 'warn' | 'info' | 'breakpoint' | 'sat' | 'unsat';

export interface Toast {
	id?: number;
	type?: ToastType;
	title: string;
	description?: string;
	dismissible?: boolean;
	timeout?: number;
}

export const toasts: Writable<Toast[]> = writable([]);

export const dismissToast = (id: number) => {
	toasts.update((all) => all.filter((t) => t.id !== id));
};

const DEFAULT_TIMEOUT = 10000; // Default timeout for toasts
const BREAKPOINT_TIMEOUT = 12000; // Timeout for breakpoint toasts
const SAT_TIMEOUT = DEFAULT_TIMEOUT; // Timeout for SAT toasts
const UNSAT_TIMEOUT = DEFAULT_TIMEOUT; // Timeout for UNSAT toasts
const INFO_TIMEOUT = DEFAULT_TIMEOUT; // Default timeout for info toasts
const WARNING_TIMEOUT = 3 * DEFAULT_TIMEOUT; // Timeout for warning toasts

const addToast = (toast: Toast) => {
	// Create a unique ID so we can easily find/remove it
	// if it is dismissible/has a timeout.
	const id = Math.floor(Math.random() * 10000);

	// Setup some sensible defaults for a toast.
	const defaults: Toast = {
		id,
		type: 'info',
		title: '<empty>',
		description: '<empty>',
		dismissible: false,
		timeout: DEFAULT_TIMEOUT
	};

	// Push the toast to the top of the list of toasts
	const t = { ...defaults, ...toast };
	toasts.update((all) => [t, ...all]);

	// If toast is dismissible, dismiss it after "timeout" amount of time.
	if (t.dismissible && t.timeout) setTimeout(() => dismissToast(id), t.timeout);
};

export const logWarning = (title: string, description: string): void => {
	console.info('title:\n', title, '\ndescription:\n', description);
	addToast({
		type: 'warn',
		title: formatText(title),
		description: formatText(description),
		dismissible: true,
		timeout: WARNING_TIMEOUT
	});
};

export const logInfo = (title: string, description?: string): void => {
	addToast({
		type: 'info',
		title: formatText(title),
		description: formatText(description),
		dismissible: true,
		timeout: INFO_TIMEOUT
	});
};

export const logBreakpoint = (title: string, description?: string): void => {
	addToast({
		type: 'breakpoint',
		title: formatText(title),
		description: formatText(description),
		dismissible: true,
		timeout: BREAKPOINT_TIMEOUT
	});
};

export const logError = (title: string, description?: string): void => {
	console.error('title:\n', title, '\ndescription:\n', description);
	addToast({
		type: 'error',
		title: formatText(title),
		description: formatText(description),
		dismissible: false
	});
};

export const logSAT = (description: string): void => {
	console.info('sat:', description);
	addToast({
		type: 'sat',
		title: 'SAT',
		description: formatText(description),
		dismissible: true,
		timeout: SAT_TIMEOUT
	});
};

export const logUnSAT = (description: string): void => {
	console.warn('UNSAT:', description);
	addToast({
		type: 'unsat',
		title: 'UNSAT',
		description: formatText(description),
		dismissible: true,
		timeout: UNSAT_TIMEOUT
	});
};

export function logFatal(title: string, description?: string): never {
	logError(title, description);
	throw title;
}

const formatText = (text?: string): string => {
	return text === undefined ? '' : text.at(0)?.toUpperCase() + text.substring(1).toLowerCase();
};

import { writable, type Writable } from 'svelte/store';

type ToastType = 'error' | 'warn' | 'info';

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

export const addToast = (toast: Toast) => {
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
		timeout: 6000
	};

	// Push the toast to the top of the list of toasts
	const t = { ...defaults, ...toast };
	toasts.update((all) => [t, ...all]);

	// If toast is dismissible, dismiss it after "timeout" amount of time.
	if (t.dismissible && t.timeout) setTimeout(() => dismissToast(id), t.timeout);
};

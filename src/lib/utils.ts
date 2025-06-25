export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

export const runningOnChrome = (): boolean => {
	const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	return isChrome;
};

export const modifyLiteralWidth = (varCount: number): void => {
	const width =
		varCount >= 1000 ? 'var(--trail-literal-large-width)' : 'var(--trail-literal-standard)';
	document.documentElement.style.setProperty('--trail-literal-min-width', width);
};

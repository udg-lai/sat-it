export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

export const modifyLiteralWidth = (varCount: number): void => {
	const width =
		varCount >= 1000 ? 'var(--trail-literal-large-width)' : 'var(--trail-literal-standard)';
	document.documentElement.style.setProperty('--trail-literal-min-width', width);
};

// Check to see if Chrome or Chromium is the current user's browser.
export const testNavigatorAgent = (): boolean => {
	return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};

export const error = (): never => {
	throw new Error('This function should not be called');
}
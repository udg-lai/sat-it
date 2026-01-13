export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

export const modifyLiteralWidth = (varCount: number): void => {
	const widthKind =
		varCount >= 1000
			? 'var(--assignment-width-large)'
			: varCount >= 100
				? 'var(--assignment-width-normal)'
				: 'var(--assignment-width-small)';
	document.documentElement.style.setProperty('--assignment-width', widthKind);
};

// Check to see if Chrome or Chromium is the current user's browser.
export const testNavigatorAgent = (): boolean => {
	return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};

export const error = (): never => {
	throw new Error('This function should not be called');
};

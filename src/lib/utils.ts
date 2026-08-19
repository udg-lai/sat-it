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

export const modifyCRefWidth = (clauseCount: number): void => {
	const basePixels: number = 25;
	const extraPixels: number = 5;
	const clauseCountLength: number = String(clauseCount).slice().length;
	document.documentElement.style.setProperty(
		'--cref-width',
		(basePixels + extraPixels * clauseCountLength).toString() + 'px'
	);
};

// Check to see if Chrome or Chromium is the current user's browser.
export const testNavigatorAgent = (): boolean => {
	return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};

export const error = (): never => {
	throw new Error('This function should not be called');
};

export function getCssVariable(container: HTMLDivElement, property: string): string {
	// Extract the value of the CSS variable from the container's computed style
	const value = getComputedStyle(container).getPropertyValue(property).trim();

	return value;
}

export function mulberry32(seed: number) {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

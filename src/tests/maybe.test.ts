import { describe, expect, it } from 'vitest';

import { fromJust, makeJust, makeNothing } from '$lib/types/maybe.ts';

describe('Maybe', () => {
	it('exposes fromJust and predicate methods on just and nothing values', () => {
		const justValue = makeJust(42);
		expect(justValue.fromJust()).toBe(42);
		expect(justValue.isJust()).toBe(true);
		expect(justValue.isNothing()).toBe(false);
		expect(fromJust(justValue)).toBe(42);

		const nothingValue = makeNothing();
		expect(() => nothingValue.fromJust()).toThrow('Attempted to unwrap a nothing value');
		expect(nothingValue.isJust()).toBe(false);
		expect(nothingValue.isNothing()).toBe(true);
		expect(() => fromJust(nothingValue)).toThrow('Attempted to unwrap a nothing value');
	});
});

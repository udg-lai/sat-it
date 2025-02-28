import VariableCollection from '$lib/transversal/entities/VariableCollection.svelte.ts';
import { isJust, unwrapMaybe } from '$lib/transversal/utils/types/maybe.ts';
import { describe, it, expect } from 'vitest';

const collection: VariableCollection = new VariableCollection(10);

const index = collection.getCurrentVariableID();
if (isJust(index)) {
	collection.assignVariable(unwrapMaybe(index), true);
}
describe('variableCollection', () => {
	it('example01', () => {
		expect(collection.getVariableState(unwrapMaybe(index))).toBe(true);
	});
});

import VariableCollection from '$lib/transversal/entities/VariableCollection.svelte.ts';
import { isJust, unwrapMaybe } from '$lib/transversal/utils/types/maybe.ts';
import { describe, it, expect } from 'vitest';

const collection: VariableCollection = new VariableCollection(10);

//First we get the variable that we want to give an assignment.
let index = collection.getCurrentVariableID();
if (isJust(index)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(index), true);
}

//Then we call the following index
index = collection.getCurrentVariableID();
if (isJust(index)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(index), true);
}

collection.assignVariable(3, false);
collection.assignVariable(9, false);
collection.assignVariable(10, true);

//Now we get the following variable to be decided.
index = collection.getCurrentVariableID();

if (isJust(index)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(index), true);
}

//Restart the counter
collection.unassignVariable(1);
collection.restartCounter();
index = collection.getCurrentVariableID();
if(isJust(index)) {
	collection.assignVariable(unwrapMaybe(index), false);
}
describe('variableCollection', () => {
	it('test01', () => {
		expect(collection.getVariableState(1)).toBe(false);
		expect(collection.getVariableState(2)).toBe(true);
		expect(collection.getVariableState(3)).toBe(false);
		expect(collection.getVariableState(4)).toBe(true);
		expect(collection.getVariableState(9)).toBe(false);
		expect(collection.getVariableState(10)).toBe(true);
	});
});
import VariableCollection from '$lib/transversal/entities/VariableCollection.svelte.ts';
import { isJust, unwrapMaybe } from '$lib/transversal/utils/types/maybe.ts';
import { describe, it, expect } from 'vitest';

const collection: VariableCollection = new VariableCollection(10);

//First we get the variable that we want to give an assignment.
let id = collection.getNextId();
if (isJust(id)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(id), true);
}

//Then we call the following index
id = collection.getNextId();
if (isJust(id)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(id), true);
}

collection.assignVariable(3, false);
collection.assignVariable(9, false);
collection.assignVariable(10, true);

//Now we get the following variable to be decided.
id = collection.getNextId();
if (isJust(id)) {
	//We give the assignment
	collection.assignVariable(unwrapMaybe(id), true);
}

//Restart the counter
collection.unassignVariable(1);
collection.restartCounter();
id = collection.getNextId();
if(isJust(id)) {
	collection.assignVariable(unwrapMaybe(id), false);
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
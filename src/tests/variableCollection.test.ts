import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import { isJust, unwrapMaybe } from '$lib/transversal/utils/types/maybe.ts';
import { describe, it, expect } from 'vitest';

const variablePool: VariablePool = new VariablePool(10);

//First we get the variable that we want to give an assignment.
let index = variablePool.nextVariableToAssign();
if (isJust(index)) {
	//We give the assignment
	variablePool.assignVariable(unwrapMaybe(index), true);
}

//Then we call the following index
index = variablePool.nextVariableToAssign();
if (isJust(index)) {
	//We give the assignment
	variablePool.assignVariable(unwrapMaybe(index), true);
}

variablePool.assignVariable(3, false);
variablePool.assignVariable(9, false);
variablePool.assignVariable(10, true);

//Now we get the following variable to be decided.
index = variablePool.nextVariableToAssign();

if (isJust(index)) {
	//We give the assignment
	variablePool.assignVariable(unwrapMaybe(index), true);
}

//Restart the counter
variablePool.unassignVariable(1);
index = variablePool.nextVariableToAssign();
if (isJust(index)) {
	variablePool.assignVariable(unwrapMaybe(index), false);
}
describe('variableCollection', () => {
	it('test01', () => {
		expect(variablePool.getVariableState(1)).toBe(false);
		expect(variablePool.getVariableState(2)).toBe(true);
		expect(variablePool.getVariableState(3)).toBe(false);
		expect(variablePool.getVariableState(4)).toBe(true);
		expect(variablePool.getVariableState(9)).toBe(false);
		expect(variablePool.getVariableState(10)).toBe(true);
	});
});

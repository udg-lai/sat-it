let inspectedVariable: number = $state(-1);
let clausesToCheck: number[] = $state([]);
let checkingIndex: number = $state(0);

export function updateClausesToCheck(toCheck: Set<number>, variable: number) {
	inspectedVariable = variable;
	checkingIndex = 0;
	clausesToCheck = [...toCheck];
}

export const getInspectedVariable = () => inspectedVariable;

export const getClausesToCheck = () => clausesToCheck;

export const getCheckingIndex = () => checkingIndex;

export const incrementCheckingIndex = () => {
	if (checkingIndex < clausesToCheck.length - 1) {
		checkingIndex++;
	}
};

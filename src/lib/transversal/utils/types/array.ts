export function arraysEqual<T>(arr1: T[], arr2: T[]) {
	return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}

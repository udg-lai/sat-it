import type { Comparable } from '../interfaces/Comparable.ts';

export function arraysEqual<T extends Comparable<T>>(arr1: T[], arr2: T[]) {
	return arr1.length === arr2.length && arr1.every((v, i) => v.equals(arr2[i]));
}

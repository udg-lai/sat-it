import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';
import { focusOnAssignment, wipeFocusAssignment } from './focused-assignment.svelte.ts';

let occurrenceList: OccurrenceList = $state(new OccurrenceList());

export function updateOccurrenceList(occurrences: OccurrenceList): void {
	occurrenceList = occurrences;
	const literal: Maybe<Lit> = occurrenceList.getLiteral();
	//The value is * -1 as the trail contains the complementary of the literal whose clauses are being checked
	if (isJust(literal)) focusOnAssignment(fromJust(literal) * -1);
	else wipeFocusAssignment();
}

export const getOccurrenceList = () => occurrenceList;

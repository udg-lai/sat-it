import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';
import { focusOnAssignment, wipeFocusAssignment } from './inspect-assignment.svelte.ts';


let occurrenceList: OccurrenceList = $state(new OccurrenceList());

export function updateOccurrenceList(occurrences: OccurrenceList): void {
	occurrenceList = occurrences;
	const literal: Maybe<Lit> = occurrenceList.getLiteral();
	if (isJust(literal))
		focusOnAssignment(fromJust(literal));
	else
		wipeFocusAssignment();
}

export const getOccurrenceList = () => occurrenceList;
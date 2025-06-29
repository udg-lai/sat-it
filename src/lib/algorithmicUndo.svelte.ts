import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import { getLatestTrail, unstackFromBeginningToX } from '$lib/states/trails.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';

export const algorithmicUndo = (
	objectiveAssignment: VariableAssignment,
	trailIndex: number
): Trail => {
	//First of all we have to slice the trail until the trailIndexValue.
	if (trailIndex < 0) {
		logFatal('Algorithmic Undo Error', `The value "trailIndex" is too low: ${trailIndex}`);
	}
	unstackFromBeginningToX(trailIndex);

	const latestTrail: Trail | undefined = getLatestTrail();
	if (latestTrail === undefined) {
		logFatal(
			'Algorithmic undo error',
			'It is not possible to undo the problem to a trail that does not exist xD'
		);
	}

	// Then it is needed to reach the assignment the user has said. I used a "do while" because we don't want to keep the decision.
	let latestAssignment: VariableAssignment | undefined;

	do {
		latestAssignment = latestTrail.pop();
		if (latestAssignment === undefined) {
			logFatal(
				'Algorithmic undo error',
				'It is not possible to undo the problem to a position that does not exist xD'
			);
		}
	} while (latestAssignment !== objectiveAssignment && latestAssignment !== undefined);

	//This extra step is to clear the conflictive clause of the trail in case there was one
	latestTrail.resetConflictClause();

	//Now we are in the position the user said, we just have to reset the state machine in the app component and we are good to go
	//It is also needed a snapshot to be saved
	return latestTrail;
};

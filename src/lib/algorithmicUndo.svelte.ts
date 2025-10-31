import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import { getLatestTrail, keepTrailsFromBeginningToX } from '$lib/states/trails.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';

export const algorithmicUndo = (
	objectiveAssignment: VariableAssignment,
	trailIndex: number
): Trail => {
	//First of all we have to slice the trail until the trailIndexValue.
	if (trailIndex < 0) {
		logFatal('Algorithmic Undo Error', `The value "trailIndex" is too low: ${trailIndex}`);
	}
	keepTrailsFromBeginningToX(trailIndex);

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
	latestTrail.clean();

	//The last thing to do in the app component is to move the state machine to the "decide step" and save a snapshot
	return latestTrail;
};

import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';

export const backjumping = (variables: VariablePool, trail: Trail, dl: number): Trail => {
	// Security check
	if (dl < 0 || dl > trail.getDL()) {
		logFatal('Decision level error', 'The entered decision level is not valid');
	}
	const bjTrail: Trail = trail.copy();
	// Erase the conflict of this trail
	bjTrail.cleanConflict();

	// As the propagations are not meant to be deleted, the DL+1 is obtained
	const shrinkTo = bjTrail.getMarkOfDecisionLevel(dl + 1);

	while (bjTrail.size() > shrinkTo) {
		const last: VariableAssignment = bjTrail.pop() as VariableAssignment;
		variables.unassign(last.getVariable().toInt());
	}

	return bjTrail;
};

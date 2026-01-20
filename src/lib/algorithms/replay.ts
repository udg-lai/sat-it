import Literal from '$lib/entities/Literal.svelte.ts';
import { updateAssignment } from '$lib/states/assignment.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import type { SavedDecision } from '$lib/states/trail-decisions.svelte.ts';
import type { List, Var } from '$lib/types/types.ts';

export async function replay(decisions: List<SavedDecision>): Promise<void> {
	// Forces solver to run to the decide state first (propagating if needed)
	await getSolverMachine().transitionByEvent('nextDecision');
	for (const { decision } of decisions) {
		//a "manual assignment will be performed"
		const polarity: boolean = !Literal.hatted(decision);
		const variable: Var = Literal.var(decision);
		updateAssignment('manual', polarity, variable);
		// Forces the solver to decide and propagate
		await getSolverMachine().transitionByEvent('branching');
	}
}

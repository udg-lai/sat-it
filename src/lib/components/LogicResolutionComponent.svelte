<script lang="ts">
	import DecisionVariable, {
		AssignmentReason
	} from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import VariablePoolBuilder from '$lib/transversal/entities/VariablePoolBuilder.ts';
	import { isJust, fromJust } from '$lib/transversal/utils/types/maybe.ts';
	import TrailCollectionVisualizerComponent from './visualizer/TrailCollectionVisualizerComponent.svelte';
	import decide from '$lib/transversal/algorithms/decision.ts';
	import {pool} from '$lib/store.ts'

	const trailCollection = new TrailCollection();
	let visualizeTrails = false;

	const nVariables = 4;
	pool.set(VariablePoolBuilder.build('VariablePool', nVariables));
	let trail: Trail = new Trail(nVariables);

	const I = [
		{
			id: 1,
			assignment: false
		},
		{
			id: 2,
			assignment: true
		},
		{
			id: 3,
			assignment: true
		}
	];
	pool.update((currentPool) => {
		for (const { assignment } of I) {
			const maybeVariableId = currentPool.nextVariableToAssign();
			if (isJust(maybeVariableId)) {
				const variableId = fromJust(maybeVariableId);
				currentPool.persist(variableId, assignment);
				const variable = currentPool.get(variableId);
				const dVariable = new DecisionVariable(variable, AssignmentReason.D);
				trail.push(dVariable);
			}
		}
		return currentPool;
	})
	

	function flipVisualize() {
		visualizeTrails = !visualizeTrails;
	}
</script>

<button
	on:click={() => decide(trailCollection, trail)}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	Decide
</button>
<button
	on:click={flipVisualize}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	visualize
</button>

<TrailCollectionVisualizerComponent {trailCollection} {trail} {visualizeTrails} />

<!-- <InterpretationVisualizerComponent {variables} />
<CnfVisualizerComponent {cnf} />

<p>
	Let's visualize the new clause created by applying logic resolution to the first and second clause
	of the cnf
</p>
<ClauseVisualizerComponent clause={resolutionClause} />

<p>The cnf is <strong>{getCNFeval()}</strong></p> -->

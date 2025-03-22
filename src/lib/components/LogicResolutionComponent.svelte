<script lang="ts">
	import DecisionVariable, {
		AssignmentReason
	} from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import VariablePoolBuilder from '$lib/transversal/entities/VariablePoolBuilder.ts';
	import { isJust, fromJust } from '$lib/transversal/utils/types/maybe.ts';
	import decide from '$lib/transversal/algorithms/decision.ts';
	import TrailEditor from './visualizer/TrailEditor.svelte';
	import { pool, persistVariable } from '$lib/store/variablePool.store.ts';
	import { get } from 'svelte/store';
	import type { IVariablePool } from '$lib/transversal/utils/interfaces/IVariablePool.ts';

	const trailCollection = new TrailCollection();
	let collapse = $state(false);
	let textCollapse = $derived(collapse ? 'Expand' : 'Collapse');

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

	const currentPool: IVariablePool = get(pool);

	for (const { assignment } of I) {
		const maybeVariableId = currentPool.nextVariableToAssign();
		if (isJust(maybeVariableId)) {
			const variableId = fromJust(maybeVariableId);
			persistVariable(variableId, assignment);
			const variable = currentPool.get(variableId);
			const dVariable = new DecisionVariable(variable, AssignmentReason.D);
			trail.push(dVariable);
		}
	}

	function flipVisualize() {
		collapse = !collapse;
	}
</script>

<button
	onclick={() => decide(trailCollection, trail)}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	Decide
</button>
<button
	onclick={flipVisualize}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	{textCollapse}
</button>

<TrailEditor previousTrails={trailCollection} currentTrail={trail} {collapse} />

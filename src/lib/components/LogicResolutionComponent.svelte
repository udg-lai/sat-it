<script lang="ts">
	import DecisionVariable, {
		AssignmentReason
	} from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import VariablePoolBuilder from '$lib/transversal/entities/VariablePoolBuilder.ts';
	import { type IVariablePool } from '$lib/transversal/utils/interfaces/IVariablePool.ts';
	import { isJust, unwrapMaybe } from '$lib/transversal/utils/types/maybe.ts';

	// let visualizeTrails = false;

	const nVariables = 4;
	const pool: IVariablePool = VariablePoolBuilder.build('VariablePool', nVariables);
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

	for (const { assignment } of I) {
		const maybeVariableId = pool.nextVariableToAssign();
		if (isJust(maybeVariableId)) {
			const variableId = unwrapMaybe(maybeVariableId);
			pool.persist(variableId, assignment);
			const variable = pool.get(variableId);
			const dVariable = new DecisionVariable(variable, AssignmentReason.D);
			trail.push(dVariable);
		}
	}

	const trailCollection = new TrailCollection();
	trailCollection.push(trail.copy());

	
 /*
	pool.dispose(1);
	const maybeVariableId = pool.nextVariableToAssign();
	if (isJust(maybeVariableId)) {
		const variableId = unwrapMaybe(maybeVariableId);
		pool.persist(variableId, true);
	}

	
 
	trail = new Trail(nVariables);
	trail.push(new DecisionVariable(pool.get(1),AssignmentReason.D,));
	*/

	// function decide() {
	// 	// TODO: define decide procedure with new api
	// }

	// function flipVisualize() {
	// 	visualizeTrails = !visualizeTrails;
	// }
</script>

<!-- <InterpretationVisualizerComponent {variables} />
<CnfVisualizerComponent {cnf} />

<p>
	Let's visualize the new clause created by applying logic resolution to the first and second clause
	of the cnf
</p>
<ClauseVisualizerComponent clause={resolutionClause} />

<p>The cnf is <strong>{getCNFeval()}</strong></p>

<button
	on:click={decide}
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

<TrailCollectionVisualizerComponent {trailCollection} {visualizeTrails} /> -->

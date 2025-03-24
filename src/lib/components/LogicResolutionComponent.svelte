<script lang="ts">
	import DecisionVariable, {
		AssignmentReason
	} from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import VariablePoolBuilder from '$lib/transversal/entities/VariablePoolBuilder.ts';
	import { isJust, fromJust } from '$lib/transversal/utils/types/maybe.ts';
	import TrailEditor from './visualizer/TrailEditor.svelte';
	import { pool, persistVariable } from '$lib/store/variablePool.store.ts';
	import { get } from 'svelte/store';
	import type { IVariablePool } from '$lib/transversal/utils/interfaces/IVariablePool.ts';
	import { onMount } from 'svelte';
	import {
		decideEvent,
		expandedEvent,
		type DecisionEvent,
		type ExpandEvent
	} from './tools/debugger/events.svelte.ts';
	import { dummySearch } from '$lib/transversal/algorithms/decision.ts';

	const trailCollection = new TrailCollection();
	let expanded = $state(false);

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

	function flipVisualize(e: ExpandEvent) {
		if (e === undefined) return;

		expanded = !expanded;
	}

	function algorithm(e: DecisionEvent<number>): void {
		if (e === undefined) return;

		if (e.decision === 'Automated') {
			dummySearch(trailCollection, trail);
		} else {
			console.log(`User decision not implemented yet`);
		}
	}

	onMount(() => {
		const unsubscribeDecision = decideEvent.subscribe(algorithm);
		const unsubscribeExpanded = expandedEvent.subscribe(flipVisualize);
		return () => {
			unsubscribeDecision();
			unsubscribeExpanded();
		};
	});
</script>

<TrailEditor previousTrails={trailCollection} currentTrail={trail} collapse={!expanded} />

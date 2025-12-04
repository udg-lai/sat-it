<script lang="ts">
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getBaselinePolarity } from '$lib/states/parameters.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import AutoModeComponent from './AutoModeComponent.svelte';
	import ConflictAnalysisDebugger from './ConflictAnalysisDebuggerComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import DecisionDebugger from './DecisionDebuggerComponent.svelte';
	import AutomaticSolvingComponent from './AutomaticSolvingComponent.svelte';
	import GeneralPurposeDebuggerComponent from './GeneralPurposeDebuggerComponent.svelte';
	import StepComponent from './buttons/StepComponent.svelte';
	import inspectClause from '$lib/icons/Inspect Next Clause.svg';
	import emptyClause from '$lib/icons/Empty Clause.svg';
	import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
	import { getVariablePool } from '$lib/states/problem.svelte.ts';
	import { getConfiguredAlgorithm } from '../settings/engine/state.svelte.ts';
	import type { Algorithm } from '$lib/types/algorithm.ts';
	import UnitPropagationDebuggerComponent from './UnitPropagationDebuggerComponent.svelte';

	const variables: VariablePool = $derived(getVariablePool());
	const currentAlgorithm: Algorithm = $derived(getConfiguredAlgorithm());

	let defaultNextVariable: number | undefined = $derived.by(() => {
		const nextVariable: Maybe<number> = variables.nextVariableToAssign();
		return isJust(nextVariable) ? fromJust(nextVariable) : undefined;
	});

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
	let enablePreprocess = $derived(solverMachine.onInitialState());
	let onPreConflictDetection = $derived(solverMachine.onPreConflictState());
	let onConflictDetection = $derived(solverMachine.onConflictDetection());
	let onConflict = $derived(solverMachine.onConflictState());
	let finished = $derived(solverMachine.completed());
	let inAutoMode = $derived(solverMachine.isInAutoMode());
</script>

<debugger>
	<algorithm-buttons>
		{#if inAutoMode}
			<AutoModeComponent />
		{:else if enablePreprocess}
			<init-step>
				<StepComponent icon={emptyClause} alt="Check Empty Clause" />
			</init-step>
		{:else}
			{#if onPreConflictDetection}
				<preConf-step>
					<StepComponent icon={inspectClause} alt="Inspect Next Clause" />
				</preConf-step>
			{:else if onConflictDetection}
				<ConflictDetectionDebugger />
				{#if currentAlgorithm !== 'backtracking'}
					<UnitPropagationDebuggerComponent />
				{/if}
			{:else if onConflict && currentAlgorithm === 'cdcl'}
				<ConflictAnalysisDebugger />
			{:else if !finished}
				<DecisionDebugger
					{onConflict}
					{finished}
					{onConflictDetection}
					nextLiteral={defaultNextVariable !== undefined && !onConflict
						? getBaselinePolarity() === true
							? defaultNextVariable
							: -defaultNextVariable
						: undefined}
				/>
			{/if}
			{#if !finished}
				<AutomaticSolvingComponent {finished} backtrackingState={onConflict} />
			{/if}
		{/if}
	</algorithm-buttons>

	<general-debugger>
		<GeneralPurposeDebuggerComponent />
	</general-debugger>
</debugger>

<style>
	debugger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--debugger-height);
		width: 100%;
		min-height: var(--debugger-height);
		padding-left: calc(var(--windows-padding) + 15px);
		padding-right: calc(var(--windows-padding) + 27px);
		border-bottom: 1px solid var(--border-color);
		gap: 0.5rem;
	}
	algorithm-buttons {
		display: flex;
		gap: 0.5rem;
	}
	general-debugger {
		display: flex;
		gap: 0.5rem;
	}
</style>

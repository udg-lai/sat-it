<script lang="ts">
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getBaselinePolarity } from '$lib/states/parameters.svelte.ts';
	import { getProblemStore } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import AutoModeComponent from './AutoModeComponent.svelte';
	import ConflictAnalysisDebugger from './ConflictAnalysisDebuggerComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import DecisionDebugger from './DecisionDebuggerComponent.svelte';
	import AutomaticSolvingComponent from './AutomaticSolvingComponent.svelte';
	import GeneralPurposeDebuggerComponent from './GeneralPurposeDebuggerComponent.svelte';
	import StepComponent from './buttons/StepComponent.svelte';
	import type Problem from '$lib/entities/Problem.svelte.ts';

	const problem: Problem = $derived(getProblemStore());

	let defaultNextVariable: number | undefined = $derived.by(() => {
		const nextVariable: Maybe<number> = problem.variables.nextVariableToAssign();
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
				<StepComponent />
			</init-step>
		{:else}
			{#if onPreConflictDetection}
				<preConf-step>
					<StepComponent />
				</preConf-step>
			{:else if onConflictDetection}
				<ConflictDetectionDebugger />
			{:else if onConflict && problem.algorithm === 'cdcl'}
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

<script lang="ts">
	import Variable from '$lib/transversal/entities/Variable.svelte.ts';
	import VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import { Modal } from 'flowbite-svelte';
	import DynamicRender from '../DynamicRender.svelte';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';

	interface Props {
		generalProps: { class: string };
	}
	let { generalProps }: Props = $props();

	let informationModal: boolean = $state(false);

	const exampleVariable = new Variable(1, true);
	const decisionExample = VariableAssignment.newManualAssignment(exampleVariable);
	const backtrackingExample = VariableAssignment.newBacktrackingAssignment(exampleVariable);
	const unitPropagationExample = VariableAssignment.newUnitPropagationAssignment(
		exampleVariable,
		1
	);
</script>

<button class="btn general-btn" title={'Trail Legend'} onclick={() => (informationModal = true)}>
	<DynamicRender component={InfoCircleOutline} props={generalProps} />
</button>

<Modal bind:open={informationModal} size="xs" outsideclose class="manual-decision">
	<div class="pointer-events-none flex flex-col items-center text-center">
		<div class="mb-4 flex w-full max-w-4xl flex-row items-start justify-center">
			<div class="flex flex-1 flex-col items-center">
				<p class="mb-2">Propagations Expanded:</p>
				<ChildlessDecisionComponent assignment={decisionExample} />
			</div>
			<div class="flex flex-1 flex-col items-center">
				<p class="mb-2">Propagations Closed:</p>
				<DecisionComponent assignment={decisionExample} expanded={false} />
			</div>
		</div>

		<div class="flex w-full max-w-4xl flex-row items-start justify-center">
			<div class="flex flex-1 flex-col items-center">
				<p class="mb-2">Backtracking</p>
				<BacktrackingComponent assignment={backtrackingExample} />
			</div>
			<div class="flex flex-1 flex-col items-center">
				<p class="mb-2">Unit Propagations</p>
				<UnitPropagationComponent assignment={unitPropagationExample} />
			</div>
		</div>
	</div>
</Modal>

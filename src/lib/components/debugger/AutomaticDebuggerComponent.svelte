<script lang="ts">
	import './_style.css';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, userActionEventBus } from '$lib/transversal/events.ts';
	import { updateAssignment } from '$lib/store/assignment.svelte.ts';

	interface Props {
		backtrackingState: boolean;
		finished: boolean;
		cdMode: boolean;
		nextVariable?: number;
	}

	let { backtrackingState, finished, cdMode: upMode, nextVariable }: Props = $props();

	const assignmentProps = {
		size: 'md'
	};
</script>

<automatic-debugger>
	<div class="join-variable">
		{#if nextVariable}
			<div class="next-variable">
				<span>
					{nextVariable}
				</span>
			</div>
		{:else}
			<div class="next-variable" class:conflict={backtrackingState}>
				<span>X</span>
			</div>
		{/if}

		{#if !backtrackingState}
			<button
				class="btn general-btn next-button"
				class:invalidOption={finished || upMode}
				onclick={() => {
					updateAssignment('automated');
					stateMachineEventBus.emit('step');
					userActionEventBus.emit('record');
				}}
				title="Decide"
				disabled={finished || upMode}
			>
				<DynamicRender component={CaretRightOutline} props={assignmentProps} />
			</button>
		{:else}
			<button
				class="btn general-btn bkt-btn next-button"
				class:invalidOption={finished || upMode}
				onclick={() => {
					stateMachineEventBus.emit('step');
				}}
				title="Backtrack"
				disabled={finished || upMode}
			>
				<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
			</button>
		{/if}
	</div>
</automatic-debugger>

<style>
	automatic-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.next-variable {
		display: flex;
		width: var(--button-size);
		height: var(--button-size);
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
		background-color: var(--button-color);
		border-color: var(--button-border-color);
	}

	.join-variable {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next-button {
		border-radius: 0 6px 6px 0;
		border-left: none;
	}

	.conflict {
		color: var(--backtracking-color);
		border: 1px dashed var(--backtracking-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
	}
</style>
